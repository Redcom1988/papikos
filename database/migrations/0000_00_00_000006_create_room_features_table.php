// File: database/migrations/0000_00_00_000006_create_room_facilities_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('room_features', function (Blueprint $table) {
            $table->id();
            $table->foreignId('room_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->text('description')->nullable();
            $table->timestamps();
            
            $table->index(['room_id', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('room_features');
    }
};