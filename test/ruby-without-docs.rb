class Calculator
  def initialize
    @history = []
  end

  def add(a, b)
    result = a + b
    @history << "#{a} + #{b} = #{result}"
    result
  end

  def subtract(a, b)
    result = a - b
    @history << "#{a} - #{b} = #{result}"
    result
  end

  def history
    @history.dup
  end
end

module MathUtils
  def self.multiply(x, y)
    x * y
  end

  def self.factorial(n)
    raise ArgumentError, "n must be non-negative" if n < 0
    return 1 if n <= 1
    n * factorial(n - 1)
  end
end

def power(base, exponent)
  base ** exponent
end