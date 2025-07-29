use std::fmt::Display;

/// Represents a point in a two-dimensional Cartesian coordinate system.
/// 
/// # Fields
/// 
/// * `x` - The x-coordinate of the point.
/// * `y` - The y-coordinate of the point.
pub struct Point {
    pub x: f64,
    pub y: f64,
}

#[derive(Debug)]
/// Represents a basic color with three possible variants:
/// - `Red`
/// - `Green`
/// - `Blue`
///
/// This enum can be used to specify or match on one of these colors.  
/// It derives the `Debug` trait to allow formatting with the `{:?}` formatter.
pub enum Color {
    Red,
    Green,
    Blue,
}

pub const PI: f64 = 3.14159265359;

/// Adds two integers and returns their sum.
/// 
/// # Parameters
/// - `a`: The first integer to add.
/// - `b`: The second integer to add.
/// 
/// # Returns
/// The sum of `a` and `b`.
pub fn add_numbers(a: i32, b: i32) -> i32 {
    a + b
}

/// Calculates the Euclidean distance between two points.
/// 
/// # Parameters
/// - `p1`: Reference to the first point.
/// - `p2`: Reference to the second point.
/// 
/// # Returns
/// The distance between `p1` and `p2` as a floating-point number.
pub fn calculate_distance(p1: &Point, p2: &Point) -> f64 {
    let dx = p1.x - p2.x;
    let dy = p1.y - p2.y;
    (dx * dx + dy * dy).sqrt()
}

/// Implementations for the `Point` struct to create and manipulate 2D points.
///
/// # Methods
/// - `new(x, y)`: Constructs a new `Point` with the given coordinates.
/// - `origin()`: Returns a `Point` at the origin (0, 0).
/// - `distance_from_origin()`: Calculates the Euclidean distance from the origin to the point.
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

/// Implements the `Display` trait for `Point` to enable formatted output.
/// 
/// Formats the point as `(x, y)` where x and y are the coordinates of the point.
/// 
/// # Parameters
/// - `f`: The formatter to write the formatted string to.
/// 
/// # Returns
/// 
/// A `Result` indicating success or failure of the write operation.
impl Display for Point {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "({}, {})", self.x, self.y)
    }
}

/// Trait for objects that can be rendered visually.
/// 
/// # Methods
/// 
/// * `draw` - Renders the object. Implementers should provide the specific drawing logic.
pub trait Drawable {
    fn draw(&self);
}

/// Entry point of the program.
/// 
/// Creates two points, one at coordinates (3.0, 4.0) and another at the origin (0.0, 0.0),
/// then calculates and prints the distance between them.
fn main() {
    let p1 = Point::new(3.0, 4.0);
    let p2 = Point::origin();
    println!("Distance: {}", calculate_distance(&p1, &p2));
}