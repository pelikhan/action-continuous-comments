# A calculator class for basic arithmetic operations
# @example
#   calc = Calculator.new
#   result = calc.add(2, 3)
#   puts result # => 5
class Calculator
  # Initialize the calculator
  # Initialize a new Calculator instance
  # Sets up an empty array to store calculation history
  # @return [void] 
  def initialize
    @history = []
  end
  def initialize
    @history = []
  end

  # Add two numbers together
  # @param a [Numeric] the first number
  # @param b [Numeric] the second number
  # @return [Numeric] the sum of a and b
  def add(a, b)
    result = a + b
    @history << "#{a} + #{b} = #{result}"
    result
  end

  # Subtract the second number from the first
  # @param a [Numeric] the number to subtract from
  # @param b [Numeric] the number to subtract
  # @return [Numeric] the difference between a and b
  def subtract(a, b)
    result = a - b
    @history << "#{a} - #{b} = #{result}"
    result
  end

  # Get the calculation history
  # @return [Array<String>] array of calculation strings
  def history
    @history.dup
  end
end

# A utility module for mathematical operations
module MathUtils
  # Multiply two numbers
  # @param x [Numeric] first number
  # @param y [Numeric] second number
  # @return [Numeric] product of x and y
  # Multiply two numbers
  # @param x [Numeric] the first operand
  # @param y [Numeric] the second operand
  # @return [Numeric] the product of x and y
  def self.multiply(x, y)
    x * y
  end

  # Calculate the factorial of a number
  # @param n [Integer] the number to calculate factorial for
  # @return [Integer] the factorial of n
  # @raise [ArgumentError] if n is negative
  def self.factorial(n)
    raise ArgumentError, "n must be non-negative" if n < 0
    return 1 if n <= 1
    n * factorial(n - 1)
  end
end

# A global function to demonstrate power operation
# @param base [Numeric] the base number
# @param exponent [Numeric] the exponent
# @return [Numeric] base raised to the power of exponent
def power(base, exponent)
  base ** exponent
end