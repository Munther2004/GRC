<?php

namespace App\Support;

use Illuminate\Contracts\Filesystem\Filesystem;
use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Support\Facades\Storage;

class StorageHelper
{
    /**
     * Return an absolute local filesystem path for a stored file.
     *
     * On local-driver disks the file already lives on disk, so the real path
     * is returned. On remote disks (e.g. s3 / DO Spaces) the file is streamed
     * down to a tempfile in the system temp dir and the tempfile path is
     * returned. Returns null if the file does not exist on the disk.
     *
     * Tempfiles are auto-cleaned at the end of the PHP request via
     * register_shutdown_function. The caller does not need to unlink them.
     */
    public static function tempLocalPath(string $disk, string $path): ?string
    {
        $fs = Storage::disk($disk);

        if (! $fs->exists($path)) {
            return null;
        }

        if (self::isLocal($fs)) {
            return $fs->path($path);
        }

        $extension = pathinfo($path, PATHINFO_EXTENSION);
        $tmp = tempnam(sys_get_temp_dir(), 'grc_remote_');
        if ($extension !== '') {
            $withExt = $tmp.'.'.$extension;
            @rename($tmp, $withExt);
            $tmp = $withExt;
        }

        file_put_contents($tmp, $fs->get($path));
        register_shutdown_function(static function () use ($tmp) {
            @unlink($tmp);
        });

        return $tmp;
    }

    private static function isLocal(Filesystem $fs): bool
    {
        if (! $fs instanceof FilesystemAdapter) {
            return false;
        }

        try {
            return $fs->getAdapter() instanceof \League\Flysystem\Local\LocalFilesystemAdapter;
        } catch (\Throwable) {
            return false;
        }
    }
}
