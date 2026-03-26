<?php

it('can generate wayfinder route types', function () {
    $this->artisan('wayfinder:generate', ['--with-form' => true])
        ->assertExitCode(0);

    expect(base_path('resources/js/routes'))->toBeDirectory()
        ->and(base_path('resources/js/wayfinder'))->toBeDirectory();
});
