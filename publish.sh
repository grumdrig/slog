# Publish changes to slog.progressquest.com
rsync -avzhC --stats --delete --delete-excluded --exclude=".*" . progressquest.com:www/slog.progressquest.com
