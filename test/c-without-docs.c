#include <stdio.h>
#include <stdlib.h>

typedef struct {
    int x;
    int y;
} Point;

typedef enum {
    RED,
    GREEN,
    BLUE
} Color;

int global_counter = 0;

int add(int a, int b) {
    return a + b;
}

void print_point(Point p) {
    printf("Point: (%d, %d)\n", p.x, p.y);
}

Point create_point(int x, int y) {
    Point p = {x, y};
    return p;
}

static int multiply(int a, int b) {
    return a * b;
}

int main(int argc, char* argv[]) {
    Point p1 = create_point(3, 4);
    print_point(p1);
    
    int sum = add(5, 7);
    printf("Sum: %d\n", sum);
    
    return 0;
}