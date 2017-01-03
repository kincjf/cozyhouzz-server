#!/bin/bash

echo If using platform you use is Windows, please execute .bat
echo And if change krpano version OR path, please re-write command in below

if [[ -z "$KRPANO_TOOL" ]]; then
  MYAPP_WRAPPER="`readlink -f "$0"`"
  HERE="`dirname "$MYAPP_WRAPPER"`"
  TOOL="tools/krpano-1.18.5-linux64"

  export KRPANO_TOOL=$HERE/$TOOL
  export PATH=$PATH:$KRPANO_TOOL
fi

echo end.
