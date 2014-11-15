#!/bin/bash

BIN=app
HERE=`dirname $(readlink -f $0)`

LIBUDEV_0=libudev.so.0
LIBUDEV_1=libudev.so.1

symlink_libudev() {
    FOLDERS=(
        "/lib/x86_64-linux-gnu"  # Ubuntu
        "/usr/lib64"             # SUSE, Fedora
        "/usr/lib"               # Arch, Fedora 32bit
        "/lib/i386-linux-gnu"    # Ubuntu 32bit
    )

    for folder in "${FOLDERS[@]}"; do
        if [ -f "${folder}/${LIBUDEV_0}" ]; then
            return 0
        fi
    done

    for folder in "${FOLDERS[@]}"; do
        if [ -f "${folder}/${LIBUDEV_1}" ]; then
            ln -sf "${folder}/${LIBUDEV_1}" "${HERE}/${LIBUDEV_0}"
            return 0
        fi
    done

    echo "${LIBUDEV_0} or ${LIBUDEV_1} not found in any of ${FOLDERS[@]}"
    exit 1
}

symlink_libudev
export LD_LIBRARY_PATH="$HERE:$LD_LIBRARY_PATH"
exec -a "$0" "$HERE/$BIN" "$@"
