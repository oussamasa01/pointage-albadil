<?php

namespace App\Http\Controllers;

use App\Models\Pointage;
use App\Models\Teacher;
use Illuminate\Http\Request;
use Carbon\Carbon;

class ExportController extends Controller
{
    public function exportPointages(Request $request)
    {
        $request->validate([
            'date_debut' => 'nullable|date',
            'date_fin' => 'nullable|date|after_or_equal:date_debut',
            'teacher_id' => 'nullable|exists:teachers,id',
        ]);

        $query = Pointage::with('teacher');

        // Filtres
        if ($request->date_debut) {
            $query->whereDate('date', '>=', $request->date_debut);
        }

        if ($request->date_fin) {
            $query->whereDate('date', '<=', $request->date_fin);
        } else if (!$request->date_debut) {
            // Par défaut, le mois en cours
            $query->whereMonth('date', Carbon::now()->month)
                  ->whereYear('date', Carbon::now()->year);
        }

        if ($request->teacher_id) {
            $query->where('teacher_id', $request->teacher_id);
        }

        $pointages = $query->orderBy('date', 'desc')
                           ->orderBy('heure', 'desc')
                           ->get();

        // Générer CSV (compatible Excel)
        $filename = 'pointages_' . Carbon::now()->format('Y-m-d_His') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        $callback = function() use ($pointages) {
            $file = fopen('php://output', 'w');

            // BOM UTF-8 pour Excel
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));

            // En-têtes
            fputcsv($file, [
                'Date',
                'Heure',
                'Matricule',
                'Nom',
                'Prénom',
                'Matière',
            ], ';');

            // Données
            foreach ($pointages as $pointage) {
                fputcsv($file, [
                    Carbon::parse($pointage->date)->format('d/m/Y'),
                    substr($pointage->heure, 0, 5),
                    $pointage->teacher->matricule,
                    $pointage->teacher->nom,
                    $pointage->teacher->prenom,
                    $pointage->teacher->matiere,
                ], ';');
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function exportStats(Request $request)
    {
        $month = $request->input('month', Carbon::now()->month);
        $year = $request->input('year', Carbon::now()->year);

        $teachers = Teacher::all();
        $stats = [];

        foreach ($teachers as $teacher) {
            $pointages = Pointage::where('teacher_id', $teacher->id)
                ->whereMonth('date', $month)
                ->whereYear('date', $year)
                ->get();

            $stats[] = [
                'teacher' => $teacher,
                'total_pointages' => $pointages->count(),
                'pointages' => $pointages,
            ];
        }

        $filename = 'stats_' . $year . '_' . str_pad($month, 2, '0', STR_PAD_LEFT) . '.csv';

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        $callback = function() use ($stats, $month, $year) {
            $file = fopen('php://output', 'w');

            // BOM UTF-8
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));

            // En-têtes
            fputcsv($file, [
                'Matricule',
                'Nom',
                'Prénom',
                'Matière',
                'Jours de Présence',
                'Taux de Présence (%)',
            ], ';');

            // Calculer le nombre de jours ouvrables dans le mois
            $daysInMonth = Carbon::create($year, $month)->daysInMonth;
            $workDays = $this->getWorkDays($year, $month);

            // Données
            foreach ($stats as $stat) {
                $teacher = $stat['teacher'];
                $presenceDays = $stat['total_pointages'];
                $tauxPresence = $workDays > 0 ? round(($presenceDays / $workDays) * 100, 2) : 0;

                fputcsv($file, [
                    $teacher->matricule,
                    $teacher->nom,
                    $teacher->prenom,
                    $teacher->matiere,
                    $presenceDays,
                    $tauxPresence,
                ], ';');
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    private function getWorkDays($year, $month)
    {
        $start = Carbon::create($year, $month, 1);
        $end = $start->copy()->endOfMonth();
        $workDays = 0;

        while ($start->lte($end)) {
            // Exclure samedi (6) et dimanche (0)
            if ($start->dayOfWeek !== 0 && $start->dayOfWeek !== 6) {
                $workDays++;
            }
            $start->addDay();
        }

        return $workDays;
    }
}
