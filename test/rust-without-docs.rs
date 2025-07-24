use std::fmt::Display;

pub struct Point {
    pub x: f64,
    pub y: f64,
}

#[derive(Debug)]
pub enum Color {
    Red,
    Green,
    Blue,
}

pub const PI: f64 = 3.14159265359;

pub fn add_numbers(a: i32, b: i32) -> i32 {
    a + b
}

pub fn calculate_distance(p1: &Point, p2: &Point) -> f64 {
    let dx = p1.x - p2.x;
    let dy = p1.y - p2.y;
    (dx * dx + dy * dy).sqrt()
}

impl Point {
    pub fn new(x: f64, y: f64) -> Self {
        Point { x, y }
    }
    
    pub fn origin() -> Self {
        Point { x: 0.0, y: 0.0 }
    }
    
    pub fn distance_from_origin(&self) -> f64 {
        (self.x * self.x + self.y * self.y).sqrt()
    }
}

impl Display for Point {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "({}, {})", self.x, self.y)
    }
}

pub trait Drawable {
    fn draw(&self);
}

fn main() {
    let p1 = Point::new(3.0, 4.0);
    let p2 = Point::origin();
    println!("Distance: {}", calculate_distance(&p1, &p2));
}