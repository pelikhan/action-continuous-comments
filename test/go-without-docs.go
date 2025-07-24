package main

import (
	"fmt"
	"math"
)

// Point represents a coordinate in a two-dimensional space with X and Y float64 values.
type Point struct {
	X, Y float64
}

// Color represents a color enumeration with possible values Red, Green, and Blue.
type Color int

const (
	Red Color = iota
	Green
	Blue
)

const PI = 3.14159265359

var GlobalCounter int

// AddNumbers returns the sum of two integers a and b.
func AddNumbers(a, b int) int {
	return a + b
}

// CalculateDistance returns the Euclidean distance between two points p1 and p2.
func CalculateDistance(p1, p2 Point) float64 {
	dx := p1.X - p2.X
	dy := p1.Y - p2.Y
	return math.Sqrt(dx*dx + dy*dy)
}

// NewPoint creates and returns a new Point with the specified x and y coordinates.
func NewPoint(x, y float64) Point {
	return Point{X: x, Y: y}
}

// DistanceFromOrigin returns the Euclidean distance of the point from the origin (0,0).
func (p Point) DistanceFromOrigin() float64 {
	return math.Sqrt(p.X*p.X + p.Y*p.Y)
}

// Move translates the Point by adding the given dx and dy to its X and Y coordinates respectively.
func (p *Point) Move(dx, dy float64) {
	p.X += dx
	p.Y += dy
}

// String returns the string representation of the Point in the format "(X, Y)" with two decimal places.
func (p Point) String() string {
	return fmt.Sprintf("(%.2f, %.2f)", p.X, p.Y)
}

type Drawable interface {
	Draw()
}

func (c Color) String() string {
	switch c {
	case Red:
		return "Red"
	case Green:
		return "Green"
	case Blue:
		return "Blue"
	default:
		return "Unknown"
	}
}

func main() {
	p1 := NewPoint(3.0, 4.0)
	p2 := NewPoint(0.0, 0.0)
	fmt.Printf("Distance: %.2f\n", CalculateDistance(p1, p2))
}