// SPDX-License-Identifier: Apache-2.0
//! Pocket-Gull Pure-Wasm Clinical & 3D Typography Compute Kernel
//!
//! Targets `wasm32-unknown-unknown` with zero external crate dependencies (`#![no_std]`)
//! and zero host `.node` binary surface area (satisfying the Windows Host Native Execution Guard
//! and Mozilla HTTP Observatory 125/100 CSP invariants).

#![no_std]

#[cfg(not(test))]
#[panic_handler]
fn panic(_info: &core::panic::PanicInfo) -> ! {
    loop {}
}

/// Computes the exact integer dot product of two Int8 quantized vectors in Wasm linear memory.
///
/// # Safety
/// Caller must guarantee `ptr_a` and `ptr_b` point to valid linear memory slices of at least `len` bytes.
#[no_mangle]
pub unsafe extern "C" fn quantized_dot_i8(
    ptr_a: *const i8,
    ptr_b: *const i8,
    len: usize,
) -> i32 {
    let mut acc: i32 = 0;
    let mut i: usize = 0;
    while i < len {
        let a = *ptr_a.add(i) as i32;
        let b = *ptr_b.add(i) as i32;
        acc = acc.wrapping_add(a.wrapping_mul(b));
        i += 1;
    }
    acc
}

/// Computes the exact squared L2 norm of an Int8 quantized vector in Wasm linear memory.
///
/// # Safety
/// Caller must guarantee `ptr` points to a valid linear memory slice of at least `len` bytes.
#[no_mangle]
pub unsafe extern "C" fn quantized_norm_sq_i8(ptr: *const i8, len: usize) -> i32 {
    let mut acc: i32 = 0;
    let mut i: usize = 0;
    while i < len {
        let v = *ptr.add(i) as i32;
        acc = acc.wrapping_add(v.wrapping_mul(v));
        i += 1;
    }
    acc
}

/// Computes a deterministic 32-bit FNV-1a integrity digest lane for FDA 21 CFR Part 11 audit trails.
///
/// # Safety
/// Caller must guarantee `ptr` points to a valid linear memory slice of at least `len` bytes.
#[no_mangle]
pub unsafe extern "C" fn fnv1a_part11_digest32(
    ptr: *const u8,
    len: usize,
    seed: u32,
) -> u32 {
    let mut hash: u32 = seed;
    let mut i: usize = 0;
    while i < len {
        let byte = *ptr.add(i) as u32;
        hash ^= byte;
        hash = hash.wrapping_mul(0x0100_0193);
        i += 1;
    }
    hash
}

/// Computes deterministic integer square root (`floor(sqrt(val))`) for 1000 UPM chisel-nib
/// Euclidean vector geometry (`w(phi) = sqrt((a*cos(phi - theta))^2 + (b*sin(phi - theta))^2)`).
#[no_mangle]
pub extern "C" fn isqrt_i32(val: i32) -> i32 {
    if val <= 0 {
        return 0;
    }
    let mut x = val as u32;
    let mut y = (x + 1) >> 1;
    while y < x {
        x = y;
        y = (x + (val as u32) / x) >> 1;
    }
    x as i32
}
