$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add('http://localhost:3000/')
$listener.Start()
Write-Host 'Server running at http://localhost:3000/'

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $context.Response.StatusCode = 200
        $context.Response.ContentType = 'text/plain; charset=utf-8'
        $message = [Text.Encoding]::UTF8.GetBytes('Room rental server is running.')
        $context.Response.ContentLength64 = $message.Length
        $context.Response.OutputStream.Write($message, 0, $message.Length)
        $context.Response.Close()
    }
}
finally {
    $listener.Stop()
    $listener.Close()
}
