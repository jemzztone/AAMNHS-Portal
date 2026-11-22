<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NotificationSetting extends Model
{
    protected $fillable = [
        'notify_on_time_in',
        'notify_on_time_out',
        'notify_on_late_only',
    ];

    protected function casts(): array
    {
        return [
            'notify_on_time_in' => 'boolean',
            'notify_on_time_out' => 'boolean',
            'notify_on_late_only' => 'boolean',
        ];
    }

    /**
     * The application stores a single row of notification preferences.
     */
    public static function current(): self
    {
        return static::query()->firstOrCreate([], [
            'notify_on_time_in' => true,
            'notify_on_time_out' => true,
            'notify_on_late_only' => false,
        ]);
    }
}
