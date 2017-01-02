const utils = require("../utils.js");
const mathjs = require("mathjs");
const Jimp = require('jimp');

class JimpPlot { //This is an module that adds some essential commands to the selfbot
    
    constructor(debug) {
        this.name = "PLOT";
        this.desc = "Jimp Plotter Module";
        this.refname = "PlotMod";
        this.id = 630, //use an ID larger than 100 so that CommandProc processes the message before this module
        this.uid = "plot1000"; //Unique ID used to save data to file
        this.isDebug = debug||false;
        //modules are run in order, from the smallest id to the largest id.
        
        
        this.currentBot = {};
        this.currentBotId = "";
        
    }
    main(eventpacket, infopacket, data) {
        if (eventpacket.botId !== eventpacket.userId || eventpacket.type !== "message") {
            return;
        }
        const symbol = infopacket.command.symbol;
        const command = infopacket.command.verb;
        const args = infopacket.command.args;
        const ev = eventpacket.event;
        const channel = eventpacket.event.channel;
        
        const firstChar = ev.content.charAt(0);
        const lastChar = ev.content.charAt(ev.content.length-1);
        
        
        if (symbol !== "/" || command !== "plot") {
            return;
        }
        if (args[0]) {
            this.plotx(args[0], args[1], args[2], channel);
        }
        
        
    }
    plotx(fx, zoom, step, channel){
    const xsize = 1024;
    const ysize = 1024;
    zoom = +zoom || 100; //zoom is (how many number of pixels) === 1;
    //step = +step;
    const pixelPrecision = 2; //how many pixels before drawing next line
    step = pixelPrecision/zoom;
    let scope = {};
    
    let endx = xsize/(2*zoom);
    let startx = -endx;
    
    const backcolour = Jimp.rgbaToInt(255,255,255,255);
    const axiscolour = Jimp.rgbaToInt(0,0,255,255);
    const textcolour = Jimp.rgbaToInt(0,255,0,255);
    //const colour = Jimp.rgbaToInt(0,0,0,255);
    let image = new Jimp(xsize,ysize, backcolour);
    
    const xmiddle = xsize/2;
    const ymiddle = ysize/2;
    
    for (let i=0; i<xsize; i++) {
        image.setPixelColor(axiscolour, i, ymiddle-1);
        image.setPixelColor(axiscolour, i, ymiddle);
        image.setPixelColor(axiscolour, i, ymiddle+1);
    }
    for (let i=0; i<ysize; i++) {
        image.setPixelColor(axiscolour, xmiddle-1, i);
        image.setPixelColor(axiscolour, xmiddle, i);
        image.setPixelColor(axiscolour, xmiddle+1, i);
    }
    const axisUnitHalfWidth = 1/64;
    const yAxisHalfWidth = xsize*axisUnitHalfWidth;
    const xAxisHalfWidth = ysize*axisUnitHalfWidth;
    
    let axe = zoom;
    let num = 1;
    let xquarter = xsize/4;
    let x32 = xsize/32;
    
    while (axe < x32) {
        axe = axe*10;
        num = num*10;
    }
    while (axe > xquarter) {
        axe = axe/10;
        num = num/10;
    }
    
    const yAxisUnitStart = xmiddle-(yAxisHalfWidth);
    const yAxisUnitEnd = xmiddle+(yAxisHalfWidth);
    for (let i=yAxisUnitStart; i<yAxisUnitEnd; i++) {
        image.setPixelColor(axiscolour, i, ymiddle-axe-1);
        image.setPixelColor(axiscolour, i, ymiddle-axe);
        image.setPixelColor(axiscolour, i, ymiddle-axe+1);
    }
    const xAxisUnitStart = ymiddle-(xAxisHalfWidth);
    const xAxisUnitEnd = ymiddle+(xAxisHalfWidth);
    for (let i=xAxisUnitStart; i<xAxisUnitEnd; i++) {
        image.setPixelColor(axiscolour, xmiddle+axe-1, i);
        image.setPixelColor(axiscolour, xmiddle+axe, i);
        image.setPixelColor(axiscolour, xmiddle+axe+1, i);
    }
    
    for (let i=startx; i<endx; i+=step) {
        let x = i;
        mathjs.eval("x="+i, scope);
        let y = mathjs.eval(fx, scope);
        mathjs.eval("x="+(i+step), scope);
        let y2 = mathjs.eval(fx, scope);
        XiaolinWu.plot((x*zoom)+xmiddle, (-y*zoom)+ymiddle, ((x+step)*zoom)+xmiddle, (-y2*zoom)+ymiddle, image);
        //image.setPixelColor(colour, i/0.2+xsize/2, -x(i)/0.2+ysize/2);
    }
    
    const textStartx = xsize/32;
    const textStarty = ysize/32;
    const textStarty2 = textStarty + 32 + 16;
    
    
    Jimp.loadFont(Jimp.FONT_SANS_32_BLACK).then(function (font) {
        image.print(font, textStartx, textStarty, ("f(x) = " + fx)).print(font, textStartx, textStarty2, ("scale: " + num))
            .getBuffer(Jimp.MIME_PNG, function(err, data) {
                channel.sendFile(data);
            });
    });
};
}

class XiaolinWu {

    static integerPart(v) {
        let isNeg = (v < 0) ? -1 : 1;
        let abs = Math.abs(v);
        let integerPart = Math.floor(abs);

        return integerPart * isNeg;
    }

    static fraction(v) {
        if (v < 0) {
            return 1 - (v - Math.floor(v));
        }

        return v - Math.floor(v);
    }

    static reverseFraction(v) {
        return 1 - XiaolinWu.fraction(v);
    }

    static round(v) {
        return XiaolinWu.integerPart(v + 0.5);
    }
    static getColourFromC(c) {
        return Jimp.rgbaToInt(c*255,c*255,c*255,255);
    }

    static plot(x0, y0, x1, y1, img) {
        if (x0 === x1 && y0 === y1) {
            return [];
        }

        let fpart = XiaolinWu.fraction;
        let rfpart = XiaolinWu.reverseFraction;
        let ipart = XiaolinWu.integerPart;
        let round = XiaolinWu.round;

        let dots = [];
        let steep = Math.abs(y1 - y0) > Math.abs(x1 - x0);

        if (steep) {
            [y0, x0] = [x0, y0];
            [y1, x1] = [x1, y1];
        }

        if (x0 > x1) {
            [x1, x0] = [x0, x1];
            [y1, y0] = [y0, y1];
        }

        let dx = x1 - x0;
        let dy = y1 - y0;
        let gradient = dy / dx;

        let xEnd = round(x0);
        let yEnd = y0 + gradient * (xEnd - x0);
        let xGap = rfpart(x0 + 0.5);
        let xPx1 = xEnd;
        let yPx1 = ipart(yEnd);

        if (steep) {
            img.setPixelColor(this.getColourFromC(rfpart(yEnd) * xGap), yPx1, xPx1);
            img.setPixelColor(this.getColourFromC(fpart(yEnd) * xGap), yPx1 + 1, xPx1);
        } else {
            img.setPixelColor(this.getColourFromC(rfpart(yEnd) * xGap), xPx1, yPx1);
            img.setPixelColor(this.getColourFromC(fpart(yEnd) * xGap), xPx1, yPx1 + 1);
        }

        let intery = yEnd + gradient;

        xEnd = round(x1);
        yEnd = y1 + gradient * (xEnd - x1);
        xGap = fpart(x1 + 0.5);

        let xPx2 = xEnd;
        let yPx2 = ipart(yEnd);

        if (steep) {
            img.setPixelColor(this.getColourFromC(rfpart(yEnd) * xGap), yPx2, xPx2);
            img.setPixelColor(this.getColourFromC(fpart(yEnd) * xGap), yPx2 + 1, xPx2);
        } else {
            img.setPixelColor(this.getColourFromC(rfpart(yEnd) * xGap), xPx2, yPx2);
            img.setPixelColor(this.getColourFromC(fpart(yEnd) * xGap), xPx2, yPx2 + 1);
        }

        if (steep) {
            for (let x = xPx1 + 1; x <= xPx2 - 1; x++) {
            img.setPixelColor(this.getColourFromC(rfpart(intery)), ipart(intery), x);
            img.setPixelColor(this.getColourFromC(fpart(intery)), ipart(intery) + 1, x);
                intery = intery + gradient;
            }
        } else {
            for (let x = xPx1 + 1; x <= xPx2 - 1; x++) {
            img.setPixelColor(this.getColourFromC(rfpart(intery)), x, ipart(intery));
            img.setPixelColor(this.getColourFromC(fpart(intery)), x, ipart(intery) + 1);
                intery = intery + gradient;
            }
        }

        return dots;
    }
}


module.exports = JimpPlot;