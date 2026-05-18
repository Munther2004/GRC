<?php

namespace App\Support;

use Illuminate\Contracts\Filesystem\Filesystem;
use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use League\Flysystem\UnableToCheckFileExistence;
use League\Flysystem\UnableToReadFile;

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

        if (self::isLocal($fs)) {
            try {
                if (! $fs->exists($path)) {
                    return null;
                }
            } catch (UnableToCheckFileExistence) {
                return null;
            }

            return $fs->path($path);
        }

        // Remote disk (s3 / DO Spaces). Skip the exists() precheck: per-bucket
        // Spaces keys lacking ListBucket make HeadObject return 403 instead of
        // 404, which Flysystem surfaces as UnableToCheckFileExistence even for
        // present objects. Attempt the download directly and treat a real miss
        // as null. See commit 1ee92ce.
        $extension = pathinfo($path, PATHINFO_EXTENSION);
        $tmp = tempnam(sys_get_temp_dir(), 'grc_remote_');
        if ($extension !== '') {
            $withExt = $tmp.'.'.$extension;
            @rename($tmp, $withExt);
            $tmp = $withExt;
        }

        try {
            $stream = $fs->readStream($path);
            if ($stream === null) {
                @unlink($tmp);

                return null;
            }

            $dest = @fopen($tmp, 'wb');
            if ($dest === false) {
                @fclose($stream);
                @unlink($tmp);
                throw new \RuntimeException("StorageHelper: unable to open tempfile [{$tmp}] for write");
            }

            stream_copy_to_stream($stream, $dest);
            @fclose($stream);
            @fclose($dest);
        } catch (UnableToReadFile|UnableToCheckFileExistence $e) {
            Log::warning('StorageHelper::tempLocalPath: remote read failed, treating as missing', [
                'disk' => $disk,
                'path' => $path,
                'error' => $e->getMessage(),
            ]);
            @unlink($tmp);

            return null;
        }

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
