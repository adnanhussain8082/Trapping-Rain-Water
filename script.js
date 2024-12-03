// Global variables
let svg, chart, x, y, chartWidth, chartHeight, waterLevels, height;

// Trapping rain water calculation function
function trapRainWater(height) {
    let left = 0, right = height.length - 1;
    let leftMax = 0, rightMax = 0;
    let water = 0;

    while (left < right) {
        if (height[left] < height[right]) {
            if (height[left] >= leftMax) {
                leftMax = height[left];
            } else {
                water += leftMax - height[left];
            }
            left++;
        } else {
            if (height[right] >= rightMax) {
                rightMax = height[right];
            } else {
                water += rightMax - height[right];
            }
            right--;
        }
    }

    return water;
}

// Visualization function
function visualize() {
    const input = document.getElementById('input').value;
    height = JSON.parse(input);
    const water = trapRainWater(height);

    document.getElementById('result').textContent = `Total trapped water: ${water} units`;
    document.getElementById('rainButton').style.display = 'block';

    const width = 760;
    const height_viz = 400;
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    chartWidth = width - margin.left - margin.right;
    chartHeight = height_viz - margin.top - margin.bottom;

    d3.select("#visualization").selectAll("*").remove();

    svg = d3.select("#visualization")
        .append("svg")
        .attr("width", width)
        .attr("height", height_viz);

    chart = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    x = d3.scaleBand()
        .range([0, chartWidth])
        .padding(0)
        .domain(height.map((d, i) => i));

    y = d3.scaleLinear()
        .range([chartHeight, 0])
        .domain([0, d3.max(height)]);

    chart.selectAll(".bar")
        .data(height)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", (d, i) => x(i))
        .attr("width", x.bandwidth())
        .attr("y", d => y(d))
        .attr("height", d => chartHeight - y(d));

    chart.selectAll(".separator")
        .data(height.slice(0, -1))
        .enter().append("line")
        .attr("class", "separator")
        .attr("x1", (d, i) => x(i) + x.bandwidth())
        .attr("x2", (d, i) => x(i) + x.bandwidth())
        .attr("y1", 0)
        .attr("y2", chartHeight)
        .attr("stroke", "#ffffff")
        .attr("stroke-width", 1);

    chart.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(0,${chartHeight})`)
        .call(d3.axisBottom(x));

    chart.append("g")
        .attr("class", "axis")
        .call(d3.axisLeft(y));

    waterLevels = calculateWaterLevels(height);
}

// Calculate water levels for each elevation point
function calculateWaterLevels(height) {
    const waterLevels = [];
    let leftMax = 0, rightMax = 0;
    const n = height.length;

    for (let i = 0; i < n; i++) {
        leftMax = Math.max(leftMax, height[i]);
        waterLevels[i] = leftMax;
    }

    for (let i = n - 1; i >= 0; i--) {
        rightMax = Math.max(rightMax, height[i]);
        waterLevels[i] = Math.min(waterLevels[i], rightMax);
    }

    return waterLevels;
}

// Rain animation function
function makeItRain() {
    const raindrops = 300;
    const animationDuration = 8000;
    const delayBetweenDrops = 10;

    for (let i = 0; i < raindrops; i++) {
        setTimeout(() => {
            const raindrop = chart.append("circle")
                .attr("class", "raindrop")
                .attr("r", 1 + Math.random())
                .attr("cx", Math.random() * chartWidth)
                .attr("cy", -10);

            raindrop.transition()
                .duration(animationDuration + Math.random() * 2000)
                .ease(d3.easeLinear)
                .attr("cy", chartHeight + 10)
                .remove();
        }, i * delayBetweenDrops);
    }

    setTimeout(() => {
        fillWater(0);
    }, 3000);
}

// Fill water animation function
function fillWater(index) {
    if (index >= height.length) return;

    const waterHeight = waterLevels[index] - height[index];
    if (waterHeight > 0) {
        const totalDuration = 5000;
        const steps = 50;
        const stepDuration = totalDuration / steps;

        const waterRect = chart.append("rect")
            .attr("class", "water")
            .attr("x", x(index))
            .attr("width", x.bandwidth())
            .attr("y", y(height[index]))
            .attr("height", 0);

        for (let i = 1; i <= steps; i++) {
            waterRect.transition()
                .delay(i * stepDuration)
                .duration(stepDuration)
                .attr("y", y(height[index] + (waterHeight * i / steps)))
                .attr("height", chartHeight - y(height[index] + (waterHeight * i / steps)) - (chartHeight - y(height[index])))
                .ease(d3.easeQuadInOut);
        }
    }

    setTimeout(() => fillWater(index + 1), 300);
}
