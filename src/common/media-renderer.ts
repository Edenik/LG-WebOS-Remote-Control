import { html } from "lit";
import { ButtonConfig } from "../types/buttons";
import { iconMapping } from "./icons";

export const renderIcon = (iconName: string, color: string = "black") => {
    return Object.keys(iconMapping).includes(iconName)
        ? iconMapping[iconName]
        : html`<ha-icon style="height: 70%; width: 70%; color:${color};" icon="${iconName}"/>`;
}

export const renderImage = (url: string, overlayColor: string = undefined, width: number = 24, height: number = 24) => {
    // Create an image element
    const imgElement = document.createElement("img");
    imgElement.src = url;
    imgElement.width = width;
    imgElement.height = height;
    imgElement.style.display = 'block'; // Ensure the image is block-level

    // Create a container for the image
    const container = document.createElement("div");
    container.style.position = "relative";
    container.style.width = `${width}px`;
    container.style.height = `${height}px`;

    // Append the image to the container
    container.appendChild(imgElement);

    // If an overlay color is provided, create a colored overlay
    if (overlayColor) {
        const overlay = document.createElement("div");
        overlay.style.position = "absolute";
        overlay.style.top = "0";
        overlay.style.left = "0";
        overlay.style.width = "100%";
        overlay.style.height = "100%";
        overlay.style.backgroundColor = overlayColor;
        overlay.style.opacity = "0.5"; // Adjust opacity as needed
        container.appendChild(overlay);
    }

    // Return HTML with the image
    return html`
      ${container}
    `;
}

export const renderSvg = (url: string, iconColor: string = undefined, width = 24, height = 24) => {
    // Fetch the SVG content synchronously
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url, false);
    xhr.send();

    if (xhr.status !== 200) {
        console.error("Failed to load SVG:", xhr.statusText);
        return html``;
    }

    // Create a container to modify the SVG
    const svgContainer = document.createElement("div");
    svgContainer.innerHTML = xhr.responseText;

    const svgElement = svgContainer.querySelector("svg");
    if (!svgElement) {
        console.error("Invalid SVG content");
        return html``;
    }

    // Set SVG dimensions
    svgElement.setAttribute("width", width.toString());
    svgElement.setAttribute("height", height.toString());

    // Remove style elements if icon color is defined
    if (iconColor) {
        const styleElements = svgElement.querySelectorAll('style');
        styleElements.forEach(element => {
            element.remove();
        });

        // Set the fill color for all paths in the SVG
        svgElement.setAttribute("fill", iconColor);
        const paths = svgElement.querySelectorAll('path');
        paths.forEach(path => {
            const currentFill = path.getAttribute('fill');
            if (currentFill !== 'none' && currentFill !== 'transparent' && !(currentFill ?? "").toLowerCase().startsWith("#fff")) {
                path.setAttribute('fill', iconColor);
            }
        });
    }

    // Remove the title element from the SVG
    const titleElement = svgElement.querySelector('title');
    if (titleElement) {
        titleElement.remove();
    }

    // Return HTML with SVG
    return html`
        ${svgContainer.firstChild}
    `;
}

export const renderButtonMedia = (button: ButtonConfig) => {
    if (button.icon) { return renderIcon(button.icon, button.color); }
    if (button.svg) { return renderSvg(button.svg, button.color); }
    if (button.img) { return renderImage(button.img, button.color); }
    return "";
}

export const renderShape = (type: string) => {
    // Shape configurations
    const shapes = {
        // Input shape - used for input selection menu
        input: {
            viewBox: "0 0 260 130",
            path: "m 187 43 a 30 30 0 0 0 60 0 a 30 30 0 0 0 -60 0 " +
                "M 148 12 a 30 30 0 0 1 30 30 a 40 40 0 0 0 40 40 " +
                "a 30 30 0 0 1 30 30 v 18 h -236 v -88 a 30 30 0 0 1 30 -30",
            className: "shape-input"
        },
        // Sound shape - used for sound output menu
        sound: {
            viewBox: "0 0 260 260",
            path: "m 13 43 a 30 30 0 0 0 60 0 a 30 30 0 0 0 -60 0 " +
                "M 130 12 h 88 a 30 30 0 0 1 30 30 v 188 a 30 30 0 0 1 -30 30 " +
                "h -176 a 30 30 0 0 1 -30 -30 v -117 a 30 30 0 0 1 30 -30 " +
                "a 40 40 0 0 0 41 -41 a 30 30 0 0 1 30 -30 z",
            className: "shape-sound"
        },
        // Direction shape - used for direction pad
        direction: {
            viewBox: "0 0 80 79",
            path: "m 30 15 a 10 10 0 0 1 20 0 a 15 15 0 0 0 15 15 " +
                "a 10 10 0 0 1 0 20 a 15 15 0 0 0 -15 15 a 10 10 0 0 1 -20 0 " +
                "a 15 15 0 0 0 -15 -15 a 10 10 0 0 1 0 -20 a 15 15 0 0 0 15 -15",
            className: "shape"
        }
    };

    // Return empty if invalid shape type
    if (!shapes[type]) {
        console.warn(`Invalid shape type: ${type}`);
        return html``;
    }

    const { viewBox, path, className } = shapes[type];

    return html`
    <div class="${className}">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">
        <path 
          d="${path}" 
          fill="var(--remote-button-color)" 
          stroke="#000000" 
          stroke-width="0" 
        />
      </svg>
    </div>
  `;
}