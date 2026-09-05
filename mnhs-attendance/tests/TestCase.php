<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        $this->mirrorPhpUnitEnvIntoServer();

        parent::setUp();
    }

    /**
     * PHPUnit's `<env>` overrides only reach `putenv()` and `$_ENV`, but on
     * Windows the CLI SAPI copies the entire OS environment into `$_SERVER`,
     * and Laravel's `env()` helper reads `$_SERVER` first. When `.env` values
     * are also exported into the OS environment, they shadow phpunit.xml and
     * tests silently run against the wrong configuration (e.g. the database
     * session driver instead of the array driver). Mirroring the phpunit.xml
     * entries into `$_SERVER` keeps tests hermetic on any machine.
     */
    private function mirrorPhpUnitEnvIntoServer(): void
    {
        $config = simplexml_load_file(dirname(__DIR__).'/phpunit.xml');

        foreach ($config->php->env as $env) {
            $key = (string) $env['name'];
            $value = (string) $env['value'];

            $_SERVER[$key] = $value;
            $_ENV[$key] = $value;
            putenv("{$key}={$value}");
        }
    }
}
