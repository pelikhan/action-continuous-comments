#include <stdio.h>
#include <stdlib.h>

/**
 * @brief Represents a point in 2D space
 */
typedef struct {
    int x; /**< X coordinate */
    int y; /**< Y coordinate */
} Point;

/**
 * @brief Color enumeration
 */
typedef enum {
    RED,   /**< Red color */
    GREEN, /**< Green color */  
    BLUE   /**< Blue color */
} Color;

/** @brief Global counter variable */
int global_counter = 0;

/**
 * @brief Adds two integers
 * @param a First integer
 * @param b Second integer
 * @return Sum of a and b
 */
int add(int a, int b) {
    return a + b;
}

/**
 * @brief Prints a point to stdout
 * @param p Point to print
 */
void print_point(Point p) {
    printf("Point: (%d, %d)\n", p.x, p.y);
}

/**
 * @brief Creates a new point
 * @param x X coordinate
 * @param y Y coordinate  
 * @return New Point with given coordinates
 */
Point create_point(int x, int y) {
    Point p = {x, y};
    return p;
}

/**
 * @brief Multiplies two integers (internal function)
 * @param a First integer
 * @param b Second integer
 * @return Product of a and b
 */
static int multiply(int a, int b) {
    return a * b;
}

/**
 * @brief Main program entry point
 * @param argc Number of command line arguments
 * @param argv Array of command line argument strings
 * @return Exit code (0 for success)
 */
int main(int argc, char* argv[]) {
    Point p1 = create_point(3, 4);
    print_point(p1);
    
    int sum = add(5, 7);
    printf("Sum: %d\n", sum);
    
    return 0;
}