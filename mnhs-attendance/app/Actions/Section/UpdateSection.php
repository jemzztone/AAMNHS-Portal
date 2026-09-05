<?php

namespace App\Actions\Section;

use App\Models\Section;

class UpdateSection
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function handle(Section $section, array $data): Section
    {
        $section->update($data);

        return $section;
    }
}
