<?php

use Illuminate\Support\Facades\File;

it('generates wayfinder route types successfully', function () {
    $routesDirectory = base_path('resources/js/routes');
    $wayfinderDirectory = base_path('resources/js/wayfinder');

    $routesExisted = File::isDirectory($routesDirectory);
    $wayfinderExisted = File::isDirectory($wayfinderDirectory);
    $existingRouteFiles = $routesExisted
        ? collect(File::allFiles($routesDirectory))->map(fn ($file) => $file->getRealPath())->all()
        : [];
    $existingWayfinderFiles = $wayfinderExisted
        ? collect(File::allFiles($wayfinderDirectory))->map(fn ($file) => $file->getRealPath())->all()
        : [];

    try {
        $this->artisan('wayfinder:generate', ['--with-form' => true])
            ->assertExitCode(0);

        $routeFiles = File::allFiles($routesDirectory);
        $wayfinderFiles = File::allFiles($wayfinderDirectory);

        expect($routesDirectory)->toBeDirectory()
            ->and($wayfinderDirectory)->toBeDirectory()
            ->and($routeFiles)->not->toBeEmpty()
            ->and($wayfinderFiles)->not->toBeEmpty();

        expect(collect($routeFiles)->every(fn ($file) => $file->getExtension() === 'ts'))->toBeTrue()
            ->and(collect($wayfinderFiles)->every(fn ($file) => $file->getExtension() === 'ts'))->toBeTrue();
    } finally {
        if (! $routesExisted) {
            File::deleteDirectory($routesDirectory);
        } elseif (File::isDirectory($routesDirectory)) {
            foreach (File::allFiles($routesDirectory) as $file) {
                if (! in_array($file->getRealPath(), $existingRouteFiles, true)) {
                    File::delete($file->getRealPath());
                }
            }
        }

        if (! $wayfinderExisted) {
            File::deleteDirectory($wayfinderDirectory);
        } elseif (File::isDirectory($wayfinderDirectory)) {
            foreach (File::allFiles($wayfinderDirectory) as $file) {
                if (! in_array($file->getRealPath(), $existingWayfinderFiles, true)) {
                    File::delete($file->getRealPath());
                }
            }
        }
    }
});
