#!/bin/bash
# Retries a command on failure. Useful for running flaky commands in CI.
# $1 - the max number of attempts
# $2... - the command to run
#
# Based on:
# https://stackoverflow.com/questions/12321469/retry-a-bash-command-with-timeout

max_attempts="$1"
shift
command="$@"
attempt_num=1

die() {
    echo "Usage: $0 <max_attempts> <command>"
    echo "Example: $0 5 ls -ltr foo/"
    exit 1
}

# max_attempts is not given
if [[ -z "$max_attempts" ]]; then
    die
fi

# max_attempts is not a number
if ! [[ "$max_attempts" =~ ^[0-9]+$ ]]; then
    die
fi

# command is not given
if [[ -z "$command" ]]; then
    die
fi

until $command; do
    status=$?
    if ((attempt_num == max_attempts)); then
        echo "Attempt $attempt_num failed, no more attempts left."
        exit $status
    else
        echo "Attempt $attempt_num failed, trying again."
        ((attempt_num++))
    fi
done
