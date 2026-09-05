<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class SectionSchedule extends Model
{
    use SoftDeletes;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'section_id',
        'day_of_week',
        'start_time',
        'end_time',
        'grace_minutes',
    ];

    protected function casts(): array
    {
        return [
            'grace_minutes' => 'integer',
        ];
    }

    protected static function boot(): void
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->id)) {
                $model->id = (string) Str::uuid();
            }
        });
    }

    public function section()
    {
        return $this->belongsTo(Section::class);
    }
}
