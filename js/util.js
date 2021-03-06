/**
 * @typedef {Object} Rect
 * @property {number} x
 * @property {number} y
 * @property {number} width
 * @property {number} height
 *
 * @typedef {Object} BackgroundRects
 * @property {Rect} top
 * @property {Rect} right
 * @property {Rect} bottom
 * @property {Rect} left
 *
 * @typedef {Object} LayerRects
 * @property {Rect} focusRect
 * @property {BackgroundRects} backgroundRects
 */

class Util {
  static loadImage(file, callback) {
    const img = new FileReader();
    img.onload = (event) => {
      const b = new Image();
      b.onload = callback;
      b.src = event.target.result;
    }
    img.readAsDataURL(file);
  }

  /**
   * setImage は指定のCanvas要素に画像をセットする。
   * @param {string} canvasId キャンバス要素iD
   * @param {file} file ファイル名
   */
  static setImage(canvasId, file) {
    if (!file.type.match("image/.*")) {
      return;
    }

    const img = new FileReader();
    img.onload = (event) => {
      const b = new Image();
      b.onload = function() {
        const canvas = document.getElementById(canvasId);
        const context = canvas.getContext("2d");
        const width = this.naturalWidth;
        const height = this.naturalHeight;
        canvas.width = width;
        canvas.height = height;
        context.drawImage(b, 0, 0, width, height);
      }
      b.src = event.target.result;
    }
    img.readAsDataURL(file);
  }

  /**
   * clearCanvas は指定のCanvasを初期化する。
   * @param {string} canvasId キャンバス要素iD
   */
  static clearCanvas(canvasId) {
    const canvas = document.getElementById(canvasId);
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
  }

  static trimImage(canvasId, file, x, y, width, height) {
    const img = new FileReader();
    img.onload = (event) => {
      const b = new Image();
      b.onload = () => {
        const canvas = document.getElementById(canvasId);
        const context = canvas.getContext("2d");
        context.drawImage(b, 0, 0, width, height, x, y, width, height);
      }
      b.src = event.target.result;
    }
    img.readAsDataURL(file);
  }

  /**
   * トリミング位置を計算する。
   * @param {number} index タイルインデックス
   * @param {number} row タイル行数
   * @param {number} col タイル列数
   * @param {number} width 1タイル横幅
   * @param {number} height 1タイル縦幅
   * @return トリミング開始位置(左上)
   */
  static calcPos(index, row, col, width, height) {
    if (index <= 0) return { x: 0, y: 0 }

    const max = row * col;
    if (max <= 0) return { x: 0, y: 0 }

    if (max <= index) {
      index -= max;
    }
    const x = index % col * width;
    let y = Math.floor(index / col);
    y *= height;
    return { x: x, y: y }
  }

  /**
   * calcLayerRects はフォーカスと背景の矩形位置と幅を計算して返す。
   * 返却する矩形位置は下記の図の通り。
   *
   * +---------------+--------+
   * | top           | right  |
   * +------+--------+        |
   * | left | focus  |        |
   * |      +--------+--------+
   * |      |          bottom |
   * +------+-----------------+
   *
   * @param {number} x フォーカスのX座標
   * @param {number} y フォーカスのY座標
   * @param {number} width フォーカスの横幅
   * @param {number} height フォーカスの縦幅
   * @param {number} maxWidth トリミング対象の画像の横幅
   * @param {number} maxHeight トリミング対象の画像の縦幅
   *
   * @return {LayerRects} フォーカスと背景の矩形
   */
  static calcLayerRects(x, y, width, height, maxWidth, maxHeight) {
    const zeroRect = {x:0, y:0, width:0, height:0}
    const zeroLayer = {
      focusRect: zeroRect,
      backgroundRects: {
        top: zeroRect,
        right: zeroRect,
        bottom: zeroRect,
        left: zeroRect,
      }
    };
    if (maxWidth <= 0) return zeroLayer;
    if (maxHeight <= 0) return zeroLayer;

    x = Math.max(0, x);
    y = Math.max(0, y);
    width = Math.max(0, width);
    height = Math.max(0, height);
    width = Math.min(maxWidth, width);
    height = Math.min(maxHeight, height);
    if (maxWidth < x + width) x = maxWidth - width;
    if (maxHeight < y + height) y = maxHeight - height;

    const focusRect = {
      x: x,
      y: y,
      width: width,
      height: height
    };
    const backgroundRects = {
      top: {
        x: 0,
        y: 0,
        width: x + width,
        height: y,
      },
      right: {
        x: x + width,
        y: 0,
        width: maxWidth - x - width,
        height: y + height,
      },
      bottom: {
        x: x,
        y: y + height,
        width: maxWidth - x,
        height: maxHeight - y - height,
      },
      left: {
        x: 0,
        y: y,
        width: x,
        height: maxHeight - y,
      },
    };
    return { focusRect: focusRect, backgroundRects: backgroundRects }
  }
}

module.exports = Util;
