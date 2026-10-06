<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Teacher extends Model
{
    use HasFactory;

    protected $fillable = [
        'nom',
        'prenom',
        'photo',
        'matiere',
        'matricule',
    ];

    public function pointages()
    {
        return $this->hasMany(Pointage::class);
    }

    public function hasPointageToday()
    {
        return $this->pointages()
            ->whereDate('date', now()->toDateString())
            ->exists();
    }

    public function todayPointage()
    {
        return $this->pointages()
            ->whereDate('date', now()->toDateString())
            ->first();
    }
}
