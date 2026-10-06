<?php

namespace App\Http\Controllers;

use App\Models\Teacher;
use App\Models\Pointage;
use Carbon\Carbon;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function stats()
    {
        $today = Carbon::today()->toDateString();

        $totalTeachers = Teacher::count();
        $presentToday = Pointage::whereDate('date', $today)->distinct('teacher_id')->count();
        $absentToday = $totalTeachers - $presentToday;
        $totalPointagesToday = Pointage::whereDate('date', $today)->count();

        return response()->json([
            'total_teachers' => $totalTeachers,
            'present_today' => $presentToday,
            'absent_today' => $absentToday,
            'total_pointages_today' => $totalPointagesToday,
        ]);
    }
}
