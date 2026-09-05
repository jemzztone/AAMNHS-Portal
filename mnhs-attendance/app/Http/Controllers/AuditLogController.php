<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AuditLogController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', AuditLog::class);

        $query = AuditLog::with('user')
            ->when($request->event, fn ($q, $event) => $q->where('event', $event))
            ->when($request->user_id, fn ($q, $userId) => $q->where('user_id', $userId))
            ->when($request->auditable_type, fn ($q, $type) => $q->where('auditable_type', $type));

        $logs = $query->latest()->paginate($request->get('per_page', 50));

        $events = AuditLog::distinct()->pluck('event')->sort()->values();

        return Inertia::render('AuditLogs/Index', [
            'logs' => $logs,
            'events' => $events,
            'filters' => $request->only(['event', 'user_id', 'auditable_type']),
        ]);
    }

    public function show(AuditLog $auditLog)
    {
        $this->authorize('view', $auditLog);

        $auditLog->load('user');

        return Inertia::render('AuditLogs/Show', [
            'log' => $auditLog,
        ]);
    }
}
