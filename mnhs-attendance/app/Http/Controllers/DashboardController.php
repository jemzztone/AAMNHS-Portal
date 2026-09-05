<?php

namespace App\Http\Controllers;

use App\Actions\Dashboard\BuildDashboard;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $data = (new BuildDashboard)->handle($user);

        return Inertia::render('Dashboard', array_merge($data, [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
        ]));
    }
}
