<?php
// filepath: kost-sys-website\app\Enums\UserRole.php

namespace App\Enums;

enum UserRole: string
{
    case ADMIN = 'admin';
    case OWNER = 'owner';
    case RENTER = 'renter';

    public function label(): string
    {
        return match($this) {
            self::ADMIN => 'Administrator',
            self::OWNER => 'Property Owner',
            self::RENTER => 'Renter',
        };
    }
};