#include <iostream>
#include <cmath>
#include <memory>

namespace geometry {

class Point {
private:
    double x_, y_;

public:
    Point(double x, double y);
    
    double getX() const;
    double getY() const;
    void setX(double x);
    void setY(double y);
    
    double distanceFromOrigin() const;
    double distanceTo(const Point& other) const;
    
    Point operator+(const Point& other) const;
    Point& operator+=(const Point& other);
    
    friend std::ostream& operator<<(std::ostream& os, const Point& point);
};

enum class Color {
    Red,
    Green,
    Blue
};

template<typename T>
class Vector2D {
private:
    T x_, y_;

public:
    Vector2D(T x, T y) : x_(x), y_(y) {}
    
    T magnitude() const;
    Vector2D<T> normalize() const;
    
    template<typename U>
    auto dot(const Vector2D<U>& other) const -> decltype(x_ * other.x_);
};

double calculateDistance(const Point& p1, const Point& p2);

std::unique_ptr<Point> createPoint(double x, double y);

} // namespace geometry

// Global constants
const double PI = 3.14159265359;
const int MAX_POINTS = 1000;

int main() {
    using namespace geometry;
    
    auto p1 = createPoint(3.0, 4.0);
    auto p2 = createPoint(0.0, 0.0);
    
    std::cout << "Distance: " << calculateDistance(*p1, *p2) << std::endl;
    
    return 0;
}