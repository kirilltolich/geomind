#!/usr/bin/env perl
# GeoMind — минимальный статический сервер для локального запуска.
# Используется, когда в системе нет node/python (например, Git Bash на Windows).
#
# Запуск из корня проекта:
#   perl tools/serve.pl [порт]      (по умолчанию 8080)
# Затем открыть: http://127.0.0.1:8080/
use strict;
use warnings;
use IO::Socket::INET;

my $port = shift // 8080;

my %mime = (
  '.html' => 'text/html; charset=utf-8',
  '.htm'  => 'text/html; charset=utf-8',
  '.css'  => 'text/css; charset=utf-8',
  '.js'   => 'application/javascript; charset=utf-8',
  '.json' => 'application/json; charset=utf-8',
  '.svg'  => 'image/svg+xml',
  '.png'  => 'image/png',
  '.ico'  => 'image/x-icon',
  '.txt'  => 'text/plain; charset=utf-8',
  '.md'   => 'text/plain; charset=utf-8',
);

my $server = IO::Socket::INET->new(
  LocalAddr => '127.0.0.1',
  LocalPort => $port,
  ReuseAddr => 1,
  Listen    => 5,
  Proto     => 'tcp',
) or die "Не удалось запустить сервер на порту $port: $!\n";

print "GeoMind dev server: http://127.0.0.1:$port/\n";
print "Для остановки: Ctrl+C\n";

while (1) {
  my $client = $server->accept() or next;
  while (my $line = <$client>) {
    if ($line =~ m{^GET\s+(\S+)}) {
      handle_request($client, $1);
      last;
    }
    last if $line eq "\n" || $line eq "\r\n";
  }
  close $client;
}

sub handle_request {
  my ($client, $raw_path) = @_;
  my $path = $raw_path;
  $path =~ s/\?.*$//;
  $path =~ s/%([0-9A-Fa-f]{2})/chr(hex($1))/ge;
  $path =~ s/\.\.\///g;    # не даём уйти за пределы каталога проекта
  $path = '/index.html' if $path eq '/';

  my $file = '.' . $path;
  if (-f $file) {
    if (open my $fh, '<:raw', $file) {
      my $content = do { local $/; <$fh> };
      close $fh;
      my ($ext) = $file =~ /(\.[^.]+)$/;
      my $type = $mime{$ext} || 'application/octet-stream';
      print $client "HTTP/1.1 200 OK\r\n"
        . "Content-Type: $type\r\n"
        . "Content-Length: " . length($content) . "\r\n"
        . "Connection: close\r\n\r\n$content";
    } else {
      send_status($client, 500);
    }
  } else {
    send_status($client, 404);
  }
}

sub send_status {
  my ($client, $code) = @_;
  my %msg = (404 => 'Not Found', 500 => 'Internal Server Error');
  print $client "HTTP/1.1 $code $msg{$code}\r\n"
    . "Content-Type: text/plain; charset=utf-8\r\n"
    . "Connection: close\r\n\r\n$code $msg{$code}\n";
}