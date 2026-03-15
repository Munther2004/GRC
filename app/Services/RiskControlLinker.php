<?php

namespace App\Services;

use App\Models\Control;
use App\Models\Risk;

class RiskControlLinker
{
    public function linkAll(): int
    {
        $risks    = Risk::all();
        $controls = Control::all();
        $count    = 0;

        foreach ($risks as $risk) {
            $count += $this->linkRiskToControls($risk, $controls);
        }

        return $count;
    }

    public function linkForRisk(Risk $risk): int
    {
        $controls = Control::all();
        return $this->linkRiskToControls($risk, $controls);
    }

    public function linkForControl(Control $control): int
    {
        $risks = Risk::all();
        $count = 0;

        foreach ($risks as $risk) {
            if ($this->isMatch($risk, $control)) {
                $existing = $risk->controls()->where('control_id', $control->id)->exists();
                if (!$existing) {
                    $risk->controls()->attach($control->id, ['auto_linked' => true]);
                    $count++;
                }
            }
        }

        return $count;
    }

    private function linkRiskToControls(Risk $risk, $controls): int
    {
        $count = 0;

        foreach ($controls as $control) {
            if ($this->isMatch($risk, $control)) {
                $existing = $risk->controls()->where('controls.id', $control->id)->exists();
                if (!$existing) {
                    $risk->controls()->attach($control->id, ['auto_linked' => true]);
                    $count++;
                }
            }
        }

        return $count;
    }

    /**
     * Maps GRC risk categories → control category substrings and title keywords
     * that indicate relevance for that risk type.
     */
    private array $categoryMap = [
        'information security' => ['organisational', 'technological', 'security', 'access', 'cryptograph', 'information'],
        'technical'            => ['technological', 'technical', 'system', 'software', 'network', 'infrastructure'],
        'operational'          => ['organisational', 'operational', 'process', 'change', 'incident', 'business'],
        'compliance'           => ['organisational', 'compliance', 'legal', 'regulatory', 'audit', 'policy'],
        'legal'                => ['legal', 'regulatory', 'contractual', 'statutory', 'compliance'],
        'financial'            => ['organisational', 'financial', 'supplier', 'contract', 'procurement'],
        'strategic'            => ['organisational', 'governance', 'risk', 'strategy', 'management'],
        'human resources'      => ['people', 'human resource', 'personnel', 'staff', 'training', 'awareness'],
        'third party'          => ['supplier', 'third.party', 'vendor', 'outsourc', 'cloud', 'service provider'],
        'physical'             => ['physical', 'environmental', 'facility', 'equipment', 'clear desk'],
    ];

    private function isMatch(Risk $risk, Control $control): bool
    {
        $riskCategory    = strtolower($risk->category ?? '');
        $controlCategory = strtolower($control->category ?? '');
        $riskTitle       = strtolower($risk->title ?? '');
        $controlTitle    = strtolower($control->title ?? '');

        // 1. Direct category substring match
        if ($riskCategory && $controlCategory && (
            str_contains($riskCategory, $controlCategory) ||
            str_contains($controlCategory, $riskCategory)
        )) {
            return true;
        }

        // 2. Category mapping: does this risk category map to keywords present in the control?
        foreach ($this->categoryMap as $riskCat => $controlKeywords) {
            if (str_contains($riskCategory, $riskCat) || str_contains($riskCat, $riskCategory)) {
                foreach ($controlKeywords as $kw) {
                    if (str_contains($controlCategory, $kw) || str_contains($controlTitle, $kw)) {
                        return true;
                    }
                }
            }
        }

        // 3. Extract meaningful keywords (4+ chars) from risk category → search control title
        if ($riskCategory) {
            $stopWords = ['and', 'the', 'for', 'with', 'from', 'that', 'this'];
            $keywords  = array_filter(
                preg_split('/[\s,_\-\/]+/', $riskCategory),
                fn($k) => strlen($k) >= 4 && !in_array($k, $stopWords)
            );
            foreach ($keywords as $keyword) {
                if (str_contains($controlTitle, $keyword) || str_contains($controlCategory, $keyword)) {
                    return true;
                }
            }
        }

        // 4. Extract meaningful keywords from control title → search risk title + category
        if ($controlTitle) {
            $stopWords = ['and', 'the', 'for', 'with', 'from', 'that', 'this', 'use', 'all'];
            $keywords  = array_filter(
                preg_split('/[\s,_\-\/]+/', $controlTitle),
                fn($k) => strlen($k) >= 5 && !in_array($k, $stopWords)
            );
            foreach ($keywords as $keyword) {
                if (str_contains($riskTitle, $keyword) || str_contains($riskCategory, $keyword)) {
                    return true;
                }
            }
        }

        return false;
    }
}
