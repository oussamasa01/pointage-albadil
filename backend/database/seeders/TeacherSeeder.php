<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Teacher;

class TeacherSeeder extends Seeder
{
    public function run(): void
    {
        Teacher::create([
            'nom' => 'Alaoui',
            'prenom' => 'Ahmed',
            'matiere' => 'Mathématiques',
            'matricule' => '1025',
            'photo' => null,
        ]);

        Teacher::create([
            'nom' => 'Amrani',
            'prenom' => 'Sara',
            'matiere' => 'Français',
            'matricule' => '1026',
            'photo' => null,
        ]);

        Teacher::create([
            'nom' => 'Karim',
            'prenom' => 'Youssef',
            'matiere' => 'Physique',
            'matricule' => '1027',
            'photo' => null,
        ]);

        Teacher::create([
            'nom' => 'Bennani',
            'prenom' => 'Fatima',
            'matiere' => 'Arabe',
            'matricule' => '1028',
            'photo' => null,
        ]);

        Teacher::create([
            'nom' => 'El Idrissi',
            'prenom' => 'Mohamed',
            'matiere' => 'Histoire',
            'matricule' => '1029',
            'photo' => null,
        ]);
    }
}
