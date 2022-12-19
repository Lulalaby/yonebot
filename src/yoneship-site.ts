export function getYoneshipSite(url: string, success: boolean) {
    return `
<html>
<head>
<title>Established Yone</title>
</head>
<body>
    <h1>
    Become a Yone Today
    </h1>
    <div>
        ${
            success
                ? `<p>You clicked the button, good job.</p>`
                : `<button onclick='location.href="${url}"'>Click This Button!</button>`
        }
    </div>
</body>
</html>
    `
}
