<?php

namespace App\Http\Controllers\Warehouse;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Enums\Role;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $users = User::when($request->search, function ($query, $search) {
            $query->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
        })
        ->when($request->role, function ($query, $role) {
            $query->where('role', $role);
        })
        ->orderBy('name')
        ->paginate(10)
        ->withQueryString();

        $roles = array_map(fn($role) => [
            'value' => $role->value,
            'label' => $role->label(),
        ], Role::cases());

        return inertia('warehouse/users/index', [
            'users' => $users,
            'roles' => collect(Role::cases())->map(fn($role) => ['value' => $role->value, 'label' => $role->label()])->values()->all(),
            'filters' => $request->only('search', 'role'),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:8|confirmed',
            'role' => 'required|in:super_admin,admin,pegawai',
        ]);

        User::create($validated);

        return redirect()->back()->with('success', 'Pengguna berhasil ditambahkan');
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'password' => 'nullable|min:8|confirmed',
            'role' => 'required|in:super_admin,admin,pegawai',
        ]);

        if (empty($validated['password'])) {
            unset($validated['password']);
        }

        $user->update($validated);

        return redirect()->back()->with('success', 'Pengguna berhasil diperbarui');
    }

    public function destroy(User $user)
    {
        if ($user->id === auth()->id()) {
            return redirect()->back()->with('error', 'Anda tidak dapat menghapus akun sendiri');
        }

        if ($user->stockTransactions()->count() > 0) {
            return redirect()->back()->with('error', 'Pengguna tidak dapat dihapus karena memiliki riwayat transaksi');
        }

        $user->delete();

        return redirect()->back()->with('success', 'Pengguna berhasil dihapus');
    }
}
