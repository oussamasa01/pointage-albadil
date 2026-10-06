<?php

namespace App\Http\Controllers;

use App\Models\Teacher;
use App\Models\Pointage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class PointageController extends Controller
{
    public function lookup(Request $request)
    {
        $request->validate([
            'matricule' => 'required|string',
        ], [
            'matricule.required' => 'Le matricule est obligatoire.',
        ]);

        $teacher = Teacher::where('matricule', $request->matricule)->first();

        if (!$teacher) {
            return response()->json([
                'error' => 'Matricule incorrect',
                'message' => 'Veuillez réessayer.',
            ], 404);
        }

        // Vérifier si le professeur a déjà pointé aujourd'hui
        $todayPointage = $teacher->todayPointage();

        if ($todayPointage) {
            return response()->json([
                'teacher' => $teacher,
                'already_checked_in' => true,
                'pointage_time' => $todayPointage->heure,
            ]);
        }

        return response()->json([
            'teacher' => $teacher,
            'already_checked_in' => false,
        ]);
    }

    public function confirm(Request $request)
    {
        $request->validate([
            'teacher_id' => 'required|exists:teachers,id',
        ]);

        $teacher = Teacher::findOrFail($request->teacher_id);

        // Double vérification pour empêcher le double pointage
        if ($teacher->hasPointageToday()) {
            $todayPointage = $teacher->todayPointage();
            return response()->json([
                'error' => 'Vous avez déjà effectué votre pointage aujourd\'hui.',
                'pointage_time' => $todayPointage->heure,
            ], 422);
        }

        // Créer le pointage avec la date et l'heure du serveur
        $now = Carbon::now();

        try {
            $pointage = Pointage::create([
                'teacher_id' => $teacher->id,
                'date' => $now->toDateString(),
                'heure' => $now->toTimeString(),
            ]);

            return response()->json([
                'message' => 'Pointage enregistré',
                'pointage' => $pointage,
                'teacher' => $teacher,
            ], 201);
        } catch (\Illuminate\Database\QueryException $e) {
            // Si la contrainte unique est violée
            if ($e->getCode() === '23000') {
                $todayPointage = $teacher->todayPointage();
                return response()->json([
                    'error' => 'Vous avez déjà effectué votre pointage aujourd\'hui.',
                    'pointage_time' => $todayPointage->heure,
                ], 422);
            }
            throw $e;
        }
    }

    public function todayList()
    {
        $today = Carbon::today()->toDateString();

        $pointages = Pointage::with('teacher')
            ->whereDate('date', $today)
            ->orderBy('heure', 'desc')
            ->get();

        return response()->json($pointages);
    }

    public function list(Request $request)
    {
        $query = Pointage::with('teacher');

        // Filtre par date
        if ($request->has('date')) {
            $query->whereDate('date', $request->date);
        } else {
            // Par défaut, afficher les pointages d'aujourd'hui
            $query->whereDate('date', Carbon::today()->toDateString());
        }

        $pointages = $query->orderBy('date', 'desc')
            ->orderBy('heure', 'desc')
            ->get();

        return response()->json($pointages);
    }
}
