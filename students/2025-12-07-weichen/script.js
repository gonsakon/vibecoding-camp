// 全局變數
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const sizeSlider = document.getElementById('sizeSlider');
const sizeValue = document.getElementById('sizeValue');
const clearBtn = document.getElementById('clearBtn');
const resetBtn = document.getElementById('resetBtn');

let brickCubes = []; // 儲存所有生成的磚塊立方體
let brickSize = 85; // 預設磚塊大小
let characterDrawn = false; // 標記角色是否已繪製

// 初始化
function init() {
    drawBackground();
    drawCharacter();
    
    // 設置事件監聽器
    canvas.addEventListener('click', createBrickCube);
    sizeSlider.addEventListener('input', updateSize);
    clearBtn.addEventListener('click', clearBricks);
    resetBtn.addEventListener('click', resetScene);
    
    updateSize();
}

// 繪製背景
function drawBackground() {
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 繪製標題
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 24px Arial';
    const title = 'Minecraft Character & Brick Generator';
    const titleWidth = ctx.measureText(title).width;
    ctx.fillText(title, (canvas.width - titleWidth) / 2, 50);
    
    // 繪製說明
    ctx.fillStyle = '#646464';
    ctx.font = '14px Arial';
    ctx.fillText('HI, I am Steve, just a simple Minecraft character, from student\'s simple homework', 30, 80);
    ctx.fillText('I love building something, just like coder and bee. Click anywhere to create brick cubes!', 30, 100);
}

// 繪製角色
function drawCharacter() {
    // Steve 的比例
    const headSize = 100;
    const bodyWidth = 90;
    const bodyHeight = 120;
    const armWidth = 35;
    const armHeight = 120;
    const legWidth = 40;
    const legHeight = 120;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2 + 80;
    
    // 按照從下到上的順序繪製，確保層次正確
    // 1. 右腳 (最底層)
    drawCubeLeg(centerX + 5, centerY - 20, legWidth, legHeight, false);
    
    // 2. 左腳
    drawCubeLeg(centerX - legWidth - 5, centerY - 20, legWidth, legHeight, true);
    
    // 3. 右手
    drawCubeArm(centerX + bodyWidth / 2 - 5, centerY - 140, armWidth, armHeight, false);
    
    // 4. 身體
    drawCubeBody(centerX - bodyWidth / 2, centerY - 140, bodyWidth, bodyHeight);
    
    // 5. 左手
    drawCubeArm(centerX - bodyWidth / 2 - armWidth + 5, centerY - 140, armWidth, armHeight, true);
    
    // 6. 頭 (最上層)
    drawCube(centerX - headSize / 2 - 5, centerY - 240, headSize);
    
    characterDrawn = true;
}

// 繪製立方體（頭部）
function drawCube(x, y, size) {
    const depth = size / 3;
    
    // 繪製正面
    ctx.fillStyle = 'rgb(209, 164, 126)';
    ctx.fillRect(x + depth, y, size, size);
    
    // 繪製臉部
    drawFace(x + depth, y, size);
    
    // 繪製頂面
    ctx.fillStyle = 'rgb(111, 78, 55)';
    ctx.beginPath();
    ctx.moveTo(x + depth, y);
    ctx.lineTo(x, y - depth);
    ctx.lineTo(x + size, y - depth);
    ctx.lineTo(x + size + depth, y);
    ctx.closePath();
    ctx.fill();
    
    // 繪製側面
    ctx.fillStyle = 'rgb(198, 140, 109)';
    ctx.beginPath();
    ctx.moveTo(x, y - depth);
    ctx.lineTo(x, y - depth + size);
    ctx.lineTo(x + depth, y + size);
    ctx.lineTo(x + depth, y);
    ctx.closePath();
    ctx.fill();
    
    // 繪製側面頭髮
    drawSideHair(x, y, size, depth);
    
    // 邊框
    ctx.strokeStyle = 'rgb(60, 100, 180)';
    ctx.lineWidth = 2;
    
    // 正面邊框
    ctx.strokeRect(x + depth, y, size, size);
    
    // 頂面邊框
    ctx.beginPath();
    ctx.moveTo(x + depth, y);
    ctx.lineTo(x, y - depth);
    ctx.lineTo(x + size, y - depth);
    ctx.lineTo(x + size + depth, y);
    ctx.closePath();
    ctx.stroke();
    
    // 側面邊框
    ctx.beginPath();
    ctx.moveTo(x, y - depth);
    ctx.lineTo(x, y - depth + size);
    ctx.lineTo(x + depth, y + size);
    ctx.lineTo(x + depth, y);
    ctx.closePath();
    ctx.stroke();
}

// 繪製臉部
function drawFace(x, y, size) {
    const unit = size / 8;
    const centerX = x + size / 2;
    const centerY = y + size / 2;
    
    // 繪製臉部背景
    ctx.fillStyle = 'rgb(205, 158, 122)';
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            const pixelX = centerX + (i - 4) * unit;
            const pixelY = centerY + (j - 4) * unit;
            ctx.fillRect(pixelX, pixelY, unit, unit);
        }
    }
    
    // 顏色定義
    const hairColor = 'rgb(111, 78, 55)';
    const eyeWhite = 'rgb(255, 255, 255)';
    const pupilColor = 'rgb(130, 0, 200)';
    const mouthColor = 'rgb(82, 50, 33)';
    const noseColor = 'rgb(140, 90, 60)';
    
    // 繪製頭髮
    for (let i = 0; i < 8; i++) {
        drawPixel(centerX, centerY, i - 4, -4, unit, hairColor);
        drawPixel(centerX, centerY, i - 4, -3, unit, hairColor);
    }
    
    drawPixel(centerX, centerY, -4, -2, unit, hairColor);
    drawPixel(centerX, centerY, 3, -2, unit, hairColor);
    
    // 繪製嘴巴
    drawPixel(centerX, centerY, -2, 2, unit, mouthColor);
    drawPixel(centerX, centerY, 1, 2, unit, mouthColor);
    drawPixel(centerX, centerY, -2, 3, unit, mouthColor);
    drawPixel(centerX, centerY, 1, 3, unit, mouthColor);
    drawPixel(centerX, centerY, -1, 3, unit, mouthColor);
    drawPixel(centerX, centerY, 0, 3, unit, mouthColor);
    
    // 繪製眼睛
    drawPixel(centerX, centerY, -3, 0, unit, eyeWhite);
    drawPixel(centerX, centerY, -2, 0, unit, pupilColor);
    drawPixel(centerX, centerY, 1, 0, unit, pupilColor);
    drawPixel(centerX, centerY, 2, 0, unit, eyeWhite);
    
    // 繪製鼻子
    drawPixel(centerX, centerY, -1, 1, unit, noseColor);
    drawPixel(centerX, centerY, 0, 1, unit, noseColor);
}

// 繪製像素
function drawPixel(centerX, centerY, relX, relY, unit, color) {
    ctx.fillStyle = color;
    const pixelX = centerX + relX * unit;
    const pixelY = centerY + relY * unit;
    ctx.fillRect(pixelX, pixelY, unit, unit);
}

// 繪製側面頭髮
function drawSideHair(x, y, size, depth) {
    const hairColor = 'rgb(111, 78, 55)';
    const sideWidth = depth;
    const sideHeight = size;
    const cols = 8;
    const rows = 8;
    const pixelWidth = sideWidth / cols;
    const pixelHeight = sideHeight / rows;
    
    // 頭髮圖案
    const hairPattern = [
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 0, 0, 0, 0, 1, 1]
    ];
    
    ctx.fillStyle = hairColor;
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            if (hairPattern[row][col] === 1) {
                const pixelX = x + col * pixelWidth;
                const pixelY = y - depth + row * pixelHeight;
                ctx.fillRect(pixelX, pixelY, pixelWidth, pixelHeight);
            }
        }
    }
}

// 繪製身體
function drawCubeBody(x, y, width, height) {
    const depth = width / 3;
    const frontColor = 'rgb(0, 170, 170)';
    const topColor = 'rgb(0, 190, 190)';
    const sideColor = 'rgb(0, 140, 140)';
    const borderColor = 'rgb(0, 100, 100)';
    
    // 正面
    ctx.fillStyle = frontColor;
    ctx.fillRect(x + depth, y, width, height);
    
    // 頂面
    ctx.fillStyle = topColor;
    ctx.beginPath();
    ctx.moveTo(x + depth, y);
    ctx.lineTo(x, y - depth);
    ctx.lineTo(x + width, y - depth);
    ctx.lineTo(x + width + depth, y);
    ctx.closePath();
    ctx.fill();
    
    // 側面
    ctx.fillStyle = sideColor;
    ctx.beginPath();
    ctx.moveTo(x, y - depth);
    ctx.lineTo(x, y - depth + height);
    ctx.lineTo(x + depth, y + height);
    ctx.lineTo(x + depth, y);
    ctx.closePath();
    ctx.fill();
    
    // 邊框
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(x + depth, y, width, height);
    
    ctx.beginPath();
    ctx.moveTo(x + depth, y);
    ctx.lineTo(x, y - depth);
    ctx.lineTo(x + width, y - depth);
    ctx.lineTo(x + width + depth, y);
    ctx.closePath();
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(x, y - depth);
    ctx.lineTo(x, y - depth + height);
    ctx.lineTo(x + depth, y + height);
    ctx.lineTo(x + depth, y);
    ctx.closePath();
    ctx.stroke();
}

// 繪製手臂
function drawCubeArm(x, y, width, height, isLeft) {
    // 滑鼠點擊位置作為立方體中心 (根據Python原版邏輯調整)
    const depth = brickSize / 3; // 3D透視深度
    let x = mouseX - brickSize / 2 - depth / 2;
    let y = mouseY - brickSize / 2 + depth / 2;
    const skinTopColor = 'rgb(220, 173, 137)';
    const skinSideColor = 'rgb(180, 130, 100)';
    const sleeveFrontColor = 'rgb(0, 170, 170)';
    const sleeveTopColor = 'rgb(0, 190, 190)';
    const sleeveSideColor = 'rgb(0, 140, 140)';
    const borderColor = 'rgb(60, 100, 180)';
    
    const sleeveHeight = height / 3;
    
    // 袖子正面
    ctx.fillStyle = sleeveFrontColor;
    ctx.fillRect(x + depth, y, width, sleeveHeight);
    
    // 袖子頂面
    ctx.fillStyle = sleeveTopColor;
    ctx.beginPath();
    ctx.moveTo(x + depth, y);
    ctx.lineTo(x, y - depth);
    ctx.lineTo(x + width, y - depth);
    ctx.lineTo(x + width + depth, y);
    ctx.closePath();
    ctx.fill();
    
    // 袖子側面
    ctx.fillStyle = sleeveSideColor;
    ctx.beginPath();
    ctx.moveTo(x, y - depth);
    ctx.lineTo(x, y - depth + sleeveHeight);
    ctx.lineTo(x + depth, y + sleeveHeight);
    ctx.lineTo(x + depth, y);
    ctx.closePath();
    ctx.fill();
    
    // 皮膚部分
    const skinY = y + sleeveHeight;
    ctx.fillStyle = skinFrontColor;
    ctx.fillRect(x + depth, skinY, width, height - sleeveHeight);
    
    ctx.fillStyle = skinSideColor;
    ctx.beginPath();
    ctx.moveTo(x, skinY - depth);
    ctx.lineTo(x, skinY - depth + (height - sleeveHeight));
    ctx.lineTo(x + depth, skinY + (height - sleeveHeight));
    ctx.lineTo(x + depth, skinY);
    ctx.closePath();
    ctx.fill();
    
    // 邊框
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(x + depth, y, width, sleeveHeight);
    ctx.strokeRect(x + depth, skinY, width, height - sleeveHeight);
    
    ctx.beginPath();
    ctx.moveTo(x + depth, y);
    ctx.lineTo(x, y - depth);
    ctx.lineTo(x + width, y - depth);
    ctx.lineTo(x + width + depth, y);
    ctx.closePath();
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(x, y - depth);
    ctx.lineTo(x, y - depth + height);
    ctx.lineTo(x + depth, y + height);
    ctx.lineTo(x + depth, y);
    ctx.closePath();
    ctx.stroke();
}

// 繪製腿部
function drawCubeLeg(x, y, width, height, isLeft) {
    const depth = width / 3;
    const pantsFrontColor = 'rgb(60, 90, 180)';
    const pantsTopColor = 'rgb(80, 110, 200)';
    const pantsSideColor = 'rgb(40, 70, 140)';
    const shoeFrontColor = 'rgb(150, 150, 150)';
    const shoeTopColor = 'rgb(170, 170, 170)';
    const patterns = ['full', 'half', 'full', 'half'];
    
    // 在頂面上繪製磚塊
    for (let row = 0; row < 4; row++) {
        const pattern = patterns[row];

        // 計算磚塊在頂面上的位置（使用參數化座標）
        for (let brick = 0; brick < (pattern === 'full' ? 2 : 3); brick++) {
            // 計算磚塊在參數空間中的位置
            let uStart, uEnd;
            if (pattern === 'full') {
                uStart = brick / 2;
                uEnd = (brick + 1) / 2;
            } else { // half pattern
                if (brick === 0) { // 左半磚塊
                    uStart = 0;
                    uEnd = 0.25;
                } else if (brick === 1) { // 中間完整磚塊
                    uStart = 0.25;
                    uEnd = 0.75;
                } else { // 右半磚塊 (brick === 2)
                    uStart = 0.75;
                    uEnd = 1.0;
                }
            }

            const vStart = row / 4;
            const vEnd = (row + 1) / 4;

            // 計算四個頂點
            const points = [];
            for (const [u, v] of [[uStart, vStart], [uEnd, vStart], [uEnd, vEnd], [uStart, vEnd]]) {
                // 使用雙線性插值計算頂面座標
                const px = (1-u)*(1-v)*topPoints[1].x + u*(1-v)*topPoints[2].x + u*v*topPoints[3].x + (1-u)*v*topPoints[0].x;
                const py = (1-u)*(1-v)*topPoints[1].y + u*(1-v)*topPoints[2].y + u*v*topPoints[3].y + (1-u)*v*topPoints[0].y;
                points.push({x: px, y: py});
            }

            // 繪製磚塊
            ctx.fillStyle = brickColor;
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) {
                ctx.lineTo(points[i].x, points[i].y);
            }
            ctx.closePath();
            ctx.fill();
        }
    }
    ctx.lineTo(x + depth, shoeY);
    ctx.closePath();
    ctx.fill();
    
    // 邊框
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(x + depth, y, width, pantsHeight);
    ctx.strokeRect(x + depth, shoeY, width, shoeHeight);
    
    ctx.beginPath();
    ctx.moveTo(x + depth, y);
    ctx.lineTo(x, y - depth);
    ctx.lineTo(x + width, y - depth);
    ctx.lineTo(x + width + depth, y);
    ctx.closePath();
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(x, y - depth);
    ctx.lineTo(x, y - depth + height);
    ctx.lineTo(x + depth, y + height);
    ctx.lineTo(x + depth, y);
    ctx.closePath();
    ctx.stroke();
}

// 創建磚塊立方體
function createBrickCube(event) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    let x = mouseX - brickSize / 2;
    let y = mouseY - brickSize / 2;
    
    // 確保不會超出邊界
    x = Math.max(10, Math.min(x, canvas.width - brickSize - 10));
    y = Math.max(10, Math.min(y, canvas.height - brickSize - 10));
    
    // 繪製磚塊立方體
    drawBrickCube(x, y, brickSize);
    
    // 儲存磚塊資訊
    brickCubes.push({x, y, size: brickSize});
}

// 繪製磚塊立方體
function drawBrickCube(x, y, size) {
    const depth = size / 3;
    const frontBrickColor = 'rgb(157, 78, 58)';
    const topBrickColor = 'rgb(180, 100, 80)';
    const sideBrickColor = 'rgb(130, 60, 40)';
    const frontMortarColor = 'rgb(180, 180, 180)';
    const topMortarColor = 'rgb(200, 200, 200)';
    const sideMortarColor = 'rgb(150, 150, 150)';
    const borderColor = 'rgb(180, 180, 180)';
    
    // 繪製正面磚塊
    drawBrickFace(x + depth, y, size, size, frontBrickColor, frontMortarColor);
    
    // 繪製頂面磚塊
    drawBrickTop(x, y, size, depth, topBrickColor, topMortarColor);
    
    // 繪製側面磚塊
    drawBrickSide(x, y, size, depth, sideBrickColor, sideMortarColor);
    
    // 繪製邊框
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 2;
    
    // 正面邊框
    ctx.strokeRect(x + depth, y, size, size);
    
    // 頂面邊框
    ctx.beginPath();
    ctx.moveTo(x + depth, y);
    ctx.lineTo(x, y - depth);
    ctx.lineTo(x + size, y - depth);
    ctx.lineTo(x + size + depth, y);
    ctx.closePath();
    ctx.stroke();
    
    // 側面邊框
    ctx.beginPath();
    ctx.moveTo(x, y - depth);
    ctx.lineTo(x, y - depth + size);
    ctx.lineTo(x + depth, y + size);
    ctx.lineTo(x + depth, y);
    ctx.closePath();
    ctx.stroke();
}

// 繪製正面磚塊紋理
function drawBrickFace(x, y, width, height, brickColor, mortarColor) {
    // 繪製灰漿背景
    ctx.fillStyle = mortarColor;
    ctx.fillRect(x, y, width, height);
    
    const patterns = ['full', 'half', 'full', 'half'];
    const rowHeight = height / 4;
    
    for (let row = 0; row < 4; row++) {
        const pattern = patterns[row];
        const rowY = y + row * rowHeight;
        
        if (pattern === 'full') {
            const brickWidth = width / 2;
            
            // 左磚塊
            ctx.fillStyle = brickColor;
            ctx.fillRect(x, rowY, brickWidth, rowHeight);
            
            // 右磚塊
            ctx.fillRect(x + brickWidth, rowY, brickWidth, rowHeight);
            
            // 分隔線
            ctx.strokeStyle = mortarColor;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x + brickWidth, rowY);
            ctx.lineTo(x + brickWidth, rowY + rowHeight);
            ctx.stroke();
        } else {
            const quarterWidth = width / 4;
            const halfWidth = width / 2;
            
            // 左半磚塊
            ctx.fillStyle = brickColor;
            ctx.fillRect(x, rowY, quarterWidth, rowHeight);
            
            // 中間完整磚塊
            ctx.fillRect(x + quarterWidth, rowY, halfWidth, rowHeight);
            
            // 右半磚塊
            ctx.fillRect(x + quarterWidth + halfWidth, rowY, quarterWidth, rowHeight);
            
            // 分隔線
            ctx.strokeStyle = mortarColor;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x + quarterWidth, rowY);
            ctx.lineTo(x + quarterWidth, rowY + rowHeight);
            ctx.moveTo(x + quarterWidth + halfWidth, rowY);
            ctx.lineTo(x + quarterWidth + halfWidth, rowY + rowHeight);
            ctx.stroke();
        }
        
        // 水平分隔線
        if (row > 0) {
            ctx.strokeStyle = mortarColor;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x, rowY);
            ctx.lineTo(x + width, rowY);
            ctx.stroke();
        }
    }
}

// 繪製頂面磚塊紋理
function drawBrickTop(x, y, size, depth, brickColor, mortarColor) {
    // 頂面多邊形點
    const topPoints = [
        {x: x + depth, y: y},           // 右下
        {x: x, y: y - depth},           // 左上
        {x: x + size, y: y - depth},    // 右上
        {x: x + size + depth, y: y}     // 左下
    ];
    
    // 繪製頂面背景
    ctx.fillStyle = mortarColor;
    ctx.beginPath();
    ctx.moveTo(topPoints[0].x, topPoints[0].y);
    ctx.lineTo(topPoints[1].x, topPoints[1].y);
    ctx.lineTo(topPoints[2].x, topPoints[2].y);
    ctx.lineTo(topPoints[3].x, topPoints[3].y);
    ctx.closePath();
    ctx.fill();
    
    const patterns = ['full', 'half', 'full', 'half'];
    
    // 這裡簡化繪製，實際應用中可以根據需要實現更複雜的紋理
    ctx.fillStyle = brickColor;
    for (let row = 0; row < 4; row++) {
        const vStart = row / 4;
        const vEnd = (row + 1) / 4;
        
        for (let col = 0; col < 2; col++) {
            const pattern = patterns[row];
            let uStart, uEnd;
            
            if (pattern === 'full') {
                uStart = col / 2;
                uEnd = (col + 1) / 2;
            } else {
                if (col === 0) {
                    uStart = 0;
                    uEnd = 0.25;
                } else if (col === 1) {
                    uStart = 0.25;
                    uEnd = 0.75;
                } else {
                    continue;
                }
            }
            
            // 計算頂面磚塊的四個頂點
            const points = [];
            for (const [u, v] of [[uStart, vStart], [uEnd, vStart], [uEnd, vEnd], [uStart, vEnd]]) {
                const px = (1-u)*(1-v)*topPoints[1].x + u*(1-v)*topPoints[2].x + 
                          u*v*topPoints[3].x + (1-u)*v*topPoints[0].x;
                const py = (1-u)*(1-v)*topPoints[1].y + u*(1-v)*topPoints[2].y + 
                          u*v*topPoints[3].y + (1-u)*v*topPoints[0].y;
                points.push({x: px, y: py});
            }
            
            // 繪製磚塊
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) {
                ctx.lineTo(points[i].x, points[i].y);
            }
            ctx.closePath();
            ctx.fill();
        }
    }
}

// 繪製側面磚塊紋理（簡化版）
function drawBrickSide(x, y, size, depth, brickColor, mortarColor) {
    // 側面多邊形點
    const sidePoints = [
        {x: x, y: y - depth},           // 左上
        {x: x, y: y - depth + size},    // 左下
        {x: x + depth, y: y + size},    // 右下
        {x: x + depth, y: y}            // 右上
    ];
    
    // 繪製側面背景
    ctx.fillStyle = mortarColor;
    ctx.beginPath();
    ctx.moveTo(sidePoints[0].x, sidePoints[0].y);
    ctx.lineTo(sidePoints[1].x, sidePoints[1].y);
    ctx.lineTo(sidePoints[2].x, sidePoints[2].y);
    ctx.lineTo(sidePoints[3].x, sidePoints[3].y);
    ctx.closePath();
    ctx.fill();
    
    // 簡化側面磚塊紋理
    ctx.fillStyle = brickColor;
    const patterns = ['full', 'half', 'full', 'half'];
    const rowHeight = size / 4;
    
    for (let row = 0; row < 4; row++) {
        const pattern = patterns[row];
        const vStart = row / 4;
        const vEnd = (row + 1) / 4;
        
        if (pattern === 'full') {
            const uStart = 0;
            const uEnd = 0.5;
            
            // 繪製磚塊
            drawParametricPolygon(sidePoints, uStart, uEnd, vStart, vEnd, brickColor);
            
            const uStart2 = 0.5;
            const uEnd2 = 1;
            drawParametricPolygon(sidePoints, uStart2, uEnd2, vStart, vEnd, brickColor);
        } else {
            drawParametricPolygon(sidePoints, 0, 0.25, vStart, vEnd, brickColor);
            drawParametricPolygon(sidePoints, 0.25, 0.75, vStart, vEnd, brickColor);
            drawParametricPolygon(sidePoints, 0.75, 1, vStart, vEnd, brickColor);
        }
    }
}

// 繪製參數化多邊形
function drawParametricPolygon(points, uStart, uEnd, vStart, vEnd, color) {
    const p0 = points[0];
    const p1 = points[1];
    const p2 = points[2];
    const p3 = points[3];
    
    const vertexPoints = [];
    for (const [u, v] of [[uStart, vStart], [uEnd, vStart], [uEnd, vEnd], [uStart, vEnd]]) {
        const px = (1-u)*(1-v)*p0.x + u*(1-v)*p3.x + u*v*p2.x + (1-u)*v*p1.x;
        const py = (1-u)*(1-v)*p0.y + u*(1-v)*p3.y + u*v*p2.y + (1-u)*v*p1.y;
        vertexPoints.push({x: px, y: py});
    }
    
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(vertexPoints[0].x, vertexPoints[0].y);
    for (let i = 1; i < vertexPoints.length; i++) {
        ctx.lineTo(vertexPoints[i].x, vertexPoints[i].y);
    }
    ctx.closePath();
    ctx.fill();
}

// 更新磚塊大小
function updateSize() {
    brickSize = parseInt(sizeSlider.value);
    sizeValue.textContent = brickSize;
}

// 清除所有磚塊
function clearBricks() {
    brickCubes = [];
    redrawScene();
}

// 重置場景
function resetScene() {
    brickCubes = [];
    redrawScene();
}

// 重繪場景
function redrawScene() {
    drawBackground();
    drawCharacter();
    
    // 重新繪製所有磚塊
    brickCubes.forEach(cube => {
        drawBrickCube(cube.x, cube.y, cube.size);
    });
}

// 初始化遊戲
window.onload = init;