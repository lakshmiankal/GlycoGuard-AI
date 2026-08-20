/**
 * GlycoGuard AI - Appium Mobile E2E Test Suite Entrypoint
 */
const { runAppiumMobileTests } = require('./tests/mobile-tests');

if (require.main === module) {
    runAppiumMobileTests().catch(err => {
        console.error('[FATAL ERROR]', err);
        process.exit(1);
    });
}

module.exports = require('./tests/mobile-tests');
