package main

import (
	"fmt"
	"math"
)

type Point struct {
	X, Y float64
}

type Color int

const (
	Red Color = iota
	Green
	Blue
)

const PI = 3.14159265359

var GlobalCounter int

func AddNumbers(a, b int) int {
	return a + b
}

func CalculateDistance(p1, p2 Point) float64 {
	dx := p1.X - p2.X
	dy := p1.Y - p2.Y
	return math.Sqrt(dx*dx + dy*dy)
}

func NewPoint(x, y float64) Point {
	return Point{X: x, Y: y}
}

func (p Point) DistanceFromOrigin() float64 {
	return math.Sqrt(p.X*p.X + p.Y*p.Y)
}

func (p *Point) Move(dx, dy float64) {
	p.X += dx
	p.Y += dy
}

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