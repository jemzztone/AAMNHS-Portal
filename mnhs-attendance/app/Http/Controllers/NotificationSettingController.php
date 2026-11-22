<?php

namespace App\Http\Controllers;

use App\Models\NotificationSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificationSettingController extends Controller
{
    public function edit()
    {
        return Inertia::render('NotificationSettings/Edit', [
            'settings' => NotificationSetting::current(),
        ]);
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'notify_on_time_in' => ['required', 'boolean'],
            'notify_on_time_out' => ['required', 'boolean'],
            'notify_on_late_only' => ['required', 'boolean'],
        ]);

        NotificationSetting::current()->update($data);

        return back()->with('success', 'Notification preferences saved.');
    }
}
