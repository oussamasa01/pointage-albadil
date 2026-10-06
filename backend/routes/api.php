<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\TeacherController;
use App\Http\Controllers\PointageController;
use App\Http\Controllers\DashboardController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Routes publiques
Route::post('/admin/login', [AuthController::class, 'login']);

// Routes publiques pour le pointage
Route::post('/pointage/lookup', [PointageController::class, 'lookup']);
Route::post('/pointage/confirm', [PointageController::class, 'confirm']);

// Routes protégées (nécessitent une authentification)
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/admin/logout', [AuthController::class, 'logout']);
    Route::get('/admin/user', [AuthController::class, 'user']);

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'stats']);

    // Teachers CRUD
    Route::get('/teachers', [TeacherController::class, 'index']);
    Route::post('/teachers', [TeacherController::class, 'store']);
    Route::get('/teachers/{id}', [TeacherController::class, 'show']);
    Route::put('/teachers/{id}', [TeacherController::class, 'update']);
    Route::post('/teachers/{id}', [TeacherController::class, 'update']); // Pour supporter le form-data avec _method
    Route::delete('/teachers/{id}', [TeacherController::class, 'destroy']);

    // Pointages
    Route::get('/pointages/today', [PointageController::class, 'todayList']);
    Route::get('/pointages', [PointageController::class, 'list']);
});
