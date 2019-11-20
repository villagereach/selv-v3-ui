#!/bin/sh
if [ ! -f template.js ]; then
    cat /usr/share/nginx/html/openlmis.js > template.js 
fi
envsubst "`printf '${%s} ' $(sh -c "env|cut -d'=' -f1")`" < template.js  > /usr/share/nginx/html/openlmis.js

node consul/registration.js -c register -f consul/config.json
nginx -g 'daemon off;'
