<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('warehouse', function ($user) {
    return $user !== null;
});