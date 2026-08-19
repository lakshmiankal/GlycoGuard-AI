const http = require('http');
const { spawn } = require('child_process');
const path = require('path');
const WebSocket = require('stream');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const htmlPath = 'file:///' + path.resolve('www/index.html').replace(/\\/g, '/');
const port = 9222;

console.log('--- LAUNCHING HEADLESS CHROME FOR DOM SCROLL GEOMETRY VERIFICATION ---');

const chrome = spawn(chromePath, [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    '--window-size=390,844',
    '--hide-scrollbars',
    '--no-sandbox',
    htmlPath
]);

setTimeout(() => {
    http.get(`http://127.0.0.1:${port}/json`, (res) => {
        let raw = '';
        res.on('data', chunk => raw += chunk);
        res.on('end', () => {
            const tabs = JSON.parse(raw);
            const wsUrl = tabs[0].webSocketDebuggerUrl;
            
            // Connect to WebSocket using Node standard
            const url = new (require('url').URL)(wsUrl);
            const req = http.request({
                hostname: url.hostname,
                port: url.port,
                path: url.pathname,
                headers: {
                    'Connection': 'Upgrade',
                    'Upgrade': 'websocket',
                    'Sec-WebSocket-Version': 13,
                    'Sec-WebSocket-Key': Buffer.from('GlycoGuardTestKey123').toString('base64')
                }
            });

            req.on('upgrade', (response, socket, head) => {
                let id = 1;
                function send(method, params) {
                    const msg = JSON.stringify({ id: id++, method, params });
                    const length = Buffer.byteLength(msg);
                    const frame = Buffer.alloc(6 + length);
                    frame[0] = 0x81; // text frame
                    frame[1] = 0x80 | length; // masked
                    frame.writeUInt32BE(0x12345678, 2); // mask key
                    const mask = [0x12, 0x34, 0x56, 0x78];
                    for (let i = 0; i < length; i++) {
                        frame[6 + i] = Buffer.from(msg)[i] ^ mask[i % 4];
                    }
                    socket.write(frame);
                }

                socket.on('data', (buf) => {
                    let offset = 2;
                    let len = buf[1] & 0x7f;
                    if (len === 126) offset = 4;
                    else if (len === 127) offset = 10;
                    const text = buf.slice(offset).toString();
                    try {
                        const parsed = JSON.parse(text);
                        if (parsed.id === 1 && parsed.result && parsed.result.result) {
                            console.log('\n--- COMPUTED SCROLL GEOMETRY & VIEWPORT METRICS ---');
                            console.log(JSON.stringify(parsed.result.result.value, null, 2));
                            chrome.kill();
                            process.exit(0);
                        }
                    } catch (e) {}
                });

                // Evaluate DOM layout and scroll
                const expression = `
                (() => {
                    const auth = document.getElementById('authView');
                    const main = document.getElementById('mainAppShell');
                    if (auth) auth.style.display = 'none';
                    if (main) main.style.display = 'block';
                    if (typeof showMainApp === 'function') showMainApp();
                    if (typeof navigateTo === 'function') navigateTo('dashboard');

                    const docEl = document.documentElement;
                    const body = document.body;
                    const shell = document.getElementById('mainAppShell');
                    const dash = document.getElementById('view-dashboard');
                    const bottomNav = document.querySelector('.bottom-nav');
                    const lastCard = document.querySelector('#dashActivityList') ? document.querySelector('#dashActivityList').closest('.card') : null;
                    const lastItem = document.querySelector('#dashActivityList .activity-item:last-child');

                    const docStyle = window.getComputedStyle(docEl);
                    const bodyStyle = window.getComputedStyle(body);
                    const shellStyle = window.getComputedStyle(shell);
                    const dashStyle = window.getComputedStyle(dash);
                    const navStyle = window.getComputedStyle(bottomNav);

                    // Pre-scroll bounding rect
                    const initialScrollY = window.scrollY;
                    const maxScrollY = Math.max(docEl.scrollHeight, body.scrollHeight) - window.innerHeight;

                    // Execute scroll to absolute bottom
                    window.scrollTo(0, maxScrollY);

                    const finalScrollY = window.scrollY;
                    const lastItemRect = lastItem ? lastItem.getBoundingClientRect() : null;
                    const lastCardRect = lastCard ? lastCard.getBoundingClientRect() : null;
                    const navRect = bottomNav ? bottomNav.getBoundingClientRect() : null;

                    return {
                        mobileViewport: {
                            width: window.innerWidth,
                            height: window.innerHeight
                        },
                        scrollContainers: {
                            html: {
                                overflowY: docStyle.overflowY,
                                computedHeight: docStyle.height,
                                clientHeight: docEl.clientHeight,
                                scrollHeight: docEl.scrollHeight,
                                isScrollable: docEl.scrollHeight > docEl.clientHeight
                            },
                            body: {
                                overflowY: bodyStyle.overflowY,
                                computedHeight: bodyStyle.height,
                                clientHeight: body.clientHeight,
                                scrollHeight: body.scrollHeight
                            },
                            mainAppShell: {
                                overflowY: shellStyle.overflowY,
                                computedHeight: shellStyle.height,
                                clientHeight: shell.clientHeight,
                                scrollHeight: shell.scrollHeight
                            },
                            viewDashboard: {
                                overflowY: dashStyle.overflowY,
                                computedHeight: dashStyle.height,
                                paddingBottom: dashStyle.paddingBottom,
                                clientHeight: dash.clientHeight,
                                scrollHeight: dash.scrollHeight
                            }
                        },
                        bottomNavigation: {
                            computedHeight: navStyle.height,
                            position: navStyle.position,
                            zIndex: navStyle.zIndex,
                            navTopFromViewportTop: navRect ? navRect.top : null,
                            navBottomFromViewportTop: navRect ? navRect.bottom : null
                        },
                        lastItemAtAbsoluteBottom: {
                            itemTop: lastItemRect ? lastItemRect.top : null,
                            itemBottom: lastItemRect ? lastItemRect.bottom : null,
                            clearanceAboveNav: (navRect && lastItemRect) ? (navRect.top - lastItemRect.bottom) : null,
                            isFullyVisibleAboveNav: (navRect && lastItemRect) ? (lastItemRect.bottom <= navRect.top) : false
                        },
                        scrollVerification: {
                            initialScrollY: initialScrollY,
                            maxScrollTarget: maxScrollY,
                            actualScrolledY: finalScrollY,
                            scrolledToBottomSuccessfully: finalScrollY > 0 && finalScrollY >= (maxScrollY - 2)
                        }
                    };
                })()
                `;

                send('Runtime.evaluate', {
                    expression: expression,
                    returnByValue: true
                });
            });

            req.end();
        });
    }).on('error', err => {
        console.error(err);
        chrome.kill();
    });
}, 1500);
