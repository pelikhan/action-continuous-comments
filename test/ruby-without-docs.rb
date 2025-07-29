# Simple calculator class that performs basic arithmetic operations and keeps a history of calculations.
#
# @example
#   calc = Calculator.new
#   calc.add(2, 3)      #=> 5
#   calc.subtract(5, 1) #=> 4
#   calc.history        #=> ["2 + 3 = 5", "5 - 1 = 4"]
class Calculator
  # Initializes a new Calculator instance with an empty history.
  def initialize
    @history = []
  end

  # Adds two numbers and records the operation in history.
  #
  # @param a [Numeric] The first addend.
  # @param b [Numeric] The second addend.
  # @return [Numeric] The sum of a and b.
  def add(a, b)
    result = a + b
    @history << "#{a} + #{b} = #{result}"
    result
  end

  # Subtracts the second number from the first and records the operation in history.
  #
  # @param a [Numeric] The minuend.
  # @param b [Numeric] The subtrahend.
  # @return [Numeric] The difference of a and b.
  def subtract(a, b)
    result = a - b
    @history << "#{a} - #{b} = #{result}"
    result
  end

  # Returns a copy of the calculation history as an array of strings.
  #
  # @return [Array<String>] The history of calculations.
  def history
    @history.dup
  end
end
class Calculator
  # Initializes a new Calculator instance.
  # Sets up an empty history of calculations.
  # @return [void] No return value.
  def initialize
    @history = []
  end

  # Adds two numbers and records the operation in history.
  # @param a [Numeric] first operand
  # @param b [Numeric] second operand
  # @return [Numeric] the sum of a and b
  def add(a, b)
    result = a + b
    @history << "#{a} + #{b} = #{result}"
    result
  end

  # Subtracts the second number from the first and records the operation in history.
  # @param a [Numeric] the minuend
  # @param b [Numeric] the subtrahend
  # @return [Numeric] the difference between a and b
  def subtract(a, b)
    result = a - b
    @history << "#{a} - #{b} = #{result}"
    result
  end

  # Returns a duplicate of the calculation history array.
  # @return [Array<String>] a copy of the recorded calculation history entries.
  def history
    @history.dup
  end
end

# Utility module providing mathematical functions.
#
# @note All methods are module methods and should be called on MathUtils directly.
module MathUtils
  # Multiplies two numbers.
  #
  # @param x [Numeric] The first number.
  # @param y [Numeric] The second number.
  # @return [Numeric] The product of x and y.
  #
  # @example
  #   MathUtils.multiply(3, 4) # => 12
  def self.multiply(x, y)
    x * y
  end

  # Computes the factorial of a non-negative integer.
  #
  # @param n [Integer] The integer for which to compute the factorial.
  # @return [Integer] The factorial of n.
  # @raise [ArgumentError] If n is negative.
  #
  # @example
  #   MathUtils.factorial(5) # => 120
  def self.factorial(n)
    raise ArgumentError, "n must be non-negative" if n < 0
    return 1 if n <= 1
    n * factorial(n - 1)
  end
end
module MathUtils
  # Multiplies two numbers.
  # @param x [Numeric] The first operand.
  # @param y [Numeric] The second operand.
  # @return [Numeric] The product of x and y.
  # @example
  #   MathUtils.multiply(3, 4) # => 12
  def self.multiply(x, y)
    x * y
  end
  def self.multiply(x, y)
    x * y
  end

  # Calculates the factorial of a non-negative integer n.
  # @param n [Integer] The number to compute the factorial of. Must be non-negative.
  # @return [Integer] The factorial of n.
  # @raise [ArgumentError] If n is negative.
  # @example
  #   MathUtils.factorial(5) #=> 120
  def self.factorial(n)
    raise ArgumentError, "n must be non-negative" if n < 0
    return 1 if n <= 1
    n * factorial(n - 1)
  end
  def self.factorial(n)
    raise ArgumentError, "n must be non-negative" if n < 0
    return 1 if n <= 1
    n * factorial(n - 1)
  end
end

# Calculates the result of raising a base number to the power of an exponent.
# @param base [Numeric] the base number
# @param exponent [Integer, Numeric] the exponent to raise the base to
# @return [Numeric] the result of base raised to the exponent
def power(base, exponent)
  base ** exponent
end