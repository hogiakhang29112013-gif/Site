
"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const CONFIG = {
    gameFolder: "./LQ_Data",
    reportFile: "./antiban_report.json"
};

function log(message) {
    console.log(`[LQ AntiBan] ${message}`);
}

function checkFolder() {
    if (!fs.existsSync(CONFIG.gameFolder)) {
        log("Không tìm thấy thư mục game.");
        return false;
    }

    log("Đã tìm thấy thư mục dữ liệu.");
    return true;
}

function scanFiles(folder) {
    const results = [];

    function scan(current) {
        for (const item of fs.readdirSync(current, {
            withFileTypes: true
        })) {
            const fullPath = path.join(current, item.name);

            if (item.isDirectory()) {
                scan(fullPath);
                continue;
            }

            const hash = crypto
                .createHash("sha256")
                .update(fs.readFileSync(fullPath))
                .digest("hex");

            results.push({
                file: fullPath,
                sha256: hash,
                size: fs.statSync(fullPath).size
            });
        }
    }

    scan(folder);
    return results;
}

function createReport(files) {
    const report = {
        scanTime: new Date().toISOString(),
        totalFiles: files.length,
        files
    };

    fs.writeFileSync(
        CONFIG.reportFile,
        JSON.stringify(report, null, 2)
    );

    log(`Đã lưu báo cáo: ${CONFIG.reportFile}`);
}

function main() {
    console.log("===== LIÊN QUÂN ANTI-RISK CHECK =====");

    if (!checkFolder()) return;

    try {
        const files = scanFiles(CONFIG.gameFolder);

        createReport(files);

        log(`Đã kiểm tra ${files.length} file.`);
        log("Hoàn tất kiểm tra SHA-256.");
        log("Lưu ý: Hash không tự xác định được file mod.");
    } catch (error) {
        log(`Lỗi kiểm tra: ${error.message}`);
    }
}

main();
