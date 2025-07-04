const fs = require("fs");
const path = require("path");

// Create assets directory if it doesn't exist
const assetsDir = path.join(__dirname, "assets");
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Simple purple square with "GG" text as a placeholder icon
// This is a minimal 64x64 PNG
const iconBase64 =
  "iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsIAAA7CARUoSoAAAAQ0SURBVHhe7ZpNaBNBFMf/m2yaNk1JW2lrRUWkiooHD+JJEcGDIHjwIHjwpngQBKF48CS0eBEP4smDeBDEkyB48QsUFQ9+gVVRqRWVWmvaJk3abHbnOZNNdrOb3WTcbJLN/GDozrx5M8n+5+3MvJ0xCCHQyZjNvzuaTgfQ8QAUlmVhcnISQ0NDaGlpQTQahWEYzV7/D4IgQK1WQ7lcRqFQwMLCAkqlErq7uzE2NoZEImELYWtra5iamsL8/DyWl5dlWzKZRCwWQzgcbvbev4RCIdhXEATY2NjA+vo6KpUKenp6cPjwYRw4cADhvXv3isnJSTE9PS2q1apgTNMUQohmr/8XpVJJTE1NiWKxKObn5wWOHz8uZmdnRbVabfZqHZqbmxOTk5NieXlZzMzMCGN0dFQsLS01e7QelUoFs7OzqFariMfjGB4eRl9fH6LRaLNH69HW1oZDhw4hk8kgn8/j6NGjMHK5HFKpVPPx1sM0TeTzeZTLZWzbtg3t7e3NlvYgGo3i4MGD2Llzp0wLxsrKCnbs2NF8vDVhh7e2tiYzQT6ft2eB9fV1+6ZdYBGwAJubmzh16hSuXr2KQqEgB0K7wQJgAVy4cAGnT5/GxYsXcfnyZZRKpWZre8ACYBGwEC5duoTz58/j7NmzuHHjRrO1PWABsAhYCJcvX8a5c+dw5swZ3Lx5s9naHrAAWAQshCtXruDcuXM4ffo0bt261WxtD1gALAIWwtWrV3Hu3DmcOnUKt2/fbrba5HI5nD9/HhcuXMCdO3earc2BBcAiYCFcu3YN586dw8mTJ3H37t1mq00+n8eNGzdw7949PHz4sNnaHFgALAIWwvXr13H27FmcOHECDx48aLba8OB3//59PHr0CI8fP262NgcWAIuAhXDjxg2cPXsWx48fx8OHD5utNvl8Hvfv38fDhw/x5MmTZmtzYAGwCFgIN2/exJkzZ3Ds2DE8evSo2WrDg9+DBw/w9OlTPHv2rNnaHFgALAIWwq1bt3D69GkcPXoUT58+bbbaPH/+HM+fv8CLFy/w8uXLZmtzYAGwCFgIt2/flgPgkSNH8OrVq2arDQ9+L1++wuvXr/HmzZtma3NgAbAIWAh37tzBqVOncPjwYbx9+7bZavPu3Tu8e/8eHz58wMePH5utzYEFwCJgIdx9+BCnTp7EoYMH8f79+2arTbFYxKdPn/D582d8+fKl2docWAAsAhbCvXv3cPLECQwPD2NxcbHZalMqlbC8vIyvX7/i27dvzdbmwAJgEbAQ7t+/jxPHj2NoaAhLS0vNVptKpYLv37/jx48fWF1dbbY2BxYAi4CFMDMzg+PHjmFwcBDFYrHZalOtVrG2toafP39idXW12docWAAsAhbCgwcPMDY2hoGBAaysrDRbbZgfP3/JVWFtba3Z2hxYACwCFsLMzAzGx8fR39+PcrlsrwBtBPPz1y/5O8D5XWAzYAGwCFgIs7OzGB8bQ19fH9bX1+1fhTcCFgD/MMJCmJubw8TEBHZ3d6NSqchVoJ1gAfAPo/8AEsZg5TvBFqcAAAAASUVORK5CYII=";

// Write the icon file
fs.writeFileSync(
  path.join(assetsDir, "icon.png"),
  Buffer.from(iconBase64, "base64")
);

console.log("Created placeholder icon.png in assets directory");
