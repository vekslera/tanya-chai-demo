# Tanya Chai logo

The symbol is a heart of two chambers, after Tanya chapter 9: the G-dly soul in the right chamber (gold), the animal soul in the left (a soft navy tint: a "construction area", not a dark side). A bold gold heart-shaped contour is drawn clockwise from the top notch around the whole heart: the G-dly soul's work gradually encompasses and refines both chambers.

## Files

| File | Use |
| --- | --- |
| `logo-mark.svg` | Static symbol for light backgrounds; contour 75% drawn |
| `logo-mark-dark.svg` | Static symbol for dark backgrounds (navy `#1E2A5A`) |
| `logo-mark-animated.svg` | Beating heart, contour drawing clockwise, left chamber briefly warming to gold; respects `prefers-reduced-motion` |
| `favicon.svg` | Simplified symbol for 16–48px (no track, thicker contour) |

## The contour as a progress indicator

In the app, the gold contour shows the user's real progress. It is a path with `pathLength="100"`, so progress P (0–100) is simply `stroke-dasharray="P 100"`. When rendering it in React, keep the path data identical to the files here and set the dasharray from state.

## Wordmark

The name is not embedded in the SVGs (fonts do not travel inside SVG files). Render it in HTML under the symbol:

- תניא in deep navy `#1E2A5A`, חי in deep gold `#B47A00`
- Font: Frank Ruhl Libre, weight 900
- Always written without gershayim: חי, never ח״י

## Colors

| Role | Hex |
| --- | --- |
| Deep navy (text, תניא) | `#1E2A5A` |
| Gold (right chamber, contour) | `#E8A317` |
| Deep gold (חי, gold text on white) | `#B47A00` |
| Navy tint (left chamber) | `#C9CEDB` |
| Warm light grey (contour track) | `#EEECE6` |
| Track on dark backgrounds | `#3A4673` |
| Background | `#FFFFFF` or toned `#FBFAF6` |

## Typography

Frank Ruhl Libre (headings, wordmark, Tanya text) and Rubik (interface), both with Hebrew support.
