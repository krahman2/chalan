# Testing Guide for Chalan Inventory System

## 🧪 Testing Setup

This project uses **Vitest** for unit testing and **React Testing Library** for component testing.

### Installation

```bash
npm install
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (recommended for development)
npm test -- --watch

# Run tests with UI interface
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

## 📋 Test Coverage

### 1. **Hook Tests** (`src/test/hooks.test.ts`)

Tests for custom React hooks that manage buyer data and credit calculations:

#### `useAllBuyers`
- ✅ Returns all unique buyers from sales, credits, and payments
- ✅ Handles empty data gracefully
- ✅ Removes duplicate buyer names

#### `useActiveBuyers`
- ✅ Returns only buyers with active sales, credits, or outstanding balances
- ✅ Filters out buyers with no relevant activity (like "Test Buyer 1")
- ✅ Includes buyers with outstanding credit even if no recent activity

#### `useOutstandingCredit`
- ✅ Calculates outstanding credit correctly for each buyer
- ✅ Handles sales with credit amounts
- ✅ Handles standalone credits
- ✅ Subtracts payments from outstanding amounts
- ✅ Prevents negative credit (overpayments become 0)

#### `useBuyersWithCredit`
- ✅ Returns only buyers with outstanding credit > 0
- ✅ Excludes buyers with zero or negative credit
- ✅ Sorts buyers alphabetically

### 2. **Component Tests** (`src/test/components.test.tsx`)

Tests for the SalesHistory component functionality:

#### Credit Tracking View
- ✅ Shows credit tracking view when button is clicked
- ✅ Displays all credit transactions in the table
- ✅ Shows correct outstanding credit amounts
- ✅ Filters transactions by buyer correctly

#### Buyer Filter
- ✅ Only shows active buyers in the filter dropdown
- ✅ Excludes buyers with no active credit or sales

#### Add Credit and Payment Buttons
- ✅ Opens add credit modal when button is clicked
- ✅ Opens add payment modal when button is clicked

#### Delete Functionality
- ✅ Calls delete credit handler when delete button is clicked

### 3. **Utility Tests** (`src/test/utils.test.ts`)

Tests for mathematical calculations and data validation:

#### Math Utilities
- ✅ `roundToCurrency`: Rounds to 2 decimal places
- ✅ `multiplyCurrency`: Multiplies currency values correctly
- ✅ `addCurrency`: Adds currency values with proper precision
- ✅ `subtractCurrency`: Subtracts currency values correctly
- ✅ `ensureNonNegative`: Prevents negative values
- ✅ `currencyEquals`: Compares currency values with tolerance

#### Data Validation
- ✅ `validateProduct`: Validates product data integrity
- ✅ `validateSale`: Validates sale data and credit info
- ✅ `validateStandaloneCredit`: Validates standalone credit data
- ✅ `validatePayment`: Validates payment against available credit

## 🐛 Bug Prevention Tests

### Credit Tracking Issue Fix
The tests specifically verify that the credit tracking view works correctly:

1. **Conditional Logic Test**: Ensures credit tracking view shows even when there are no sales
2. **Data Flow Test**: Verifies that standalone credits appear in the credit tracking table
3. **Filter Test**: Confirms that active buyers are properly filtered

### Buyer Filter Issue Fix
Tests verify that the buyer filter only shows relevant buyers:

1. **Active Buyers Test**: Ensures only buyers with active credit or sales appear
2. **Test Buyer Exclusion**: Confirms that test buyers with no activity are filtered out

## 🚀 Running Specific Tests

```bash
# Run only hook tests
npm test hooks

# Run only component tests
npm test components

# Run only utility tests
npm test utils

# Run tests matching a specific pattern
npm test -- -t "credit tracking"
```

## 📊 Coverage Reports

After running `npm run test:coverage`, you'll get a detailed report showing:

- **Line Coverage**: Percentage of code lines executed
- **Branch Coverage**: Percentage of conditional branches tested
- **Function Coverage**: Percentage of functions called
- **Statement Coverage**: Percentage of statements executed

## 🔧 Test Configuration

### Vitest Configuration (`vite.config.ts`)
```typescript
test: {
  globals: true,
  environment: 'jsdom',
  setupFiles: ['./src/test/setup.ts'],
}
```

### Test Setup (`src/test/setup.ts`)
- Mocks localStorage for consistent testing
- Sets up environment variables
- Mocks console methods to reduce noise

## 🎯 Best Practices

### Writing Tests
1. **Test the behavior, not the implementation**
2. **Use descriptive test names** that explain what should happen
3. **Test edge cases** (empty data, negative values, etc.)
4. **Mock external dependencies** (database, localStorage)

### Test Structure
```typescript
describe('Feature Name', () => {
  it('should do something specific', () => {
    // Arrange: Set up test data
    // Act: Perform the action
    // Assert: Verify the result
  })
})
```

## 🐛 Debugging Tests

### Common Issues
1. **Import errors**: Make sure all dependencies are installed
2. **Mock issues**: Check that mocks are properly set up
3. **Async tests**: Use `await` and `waitFor` for async operations

### Debug Mode
```bash
# Run tests in debug mode
npm test -- --debug
```

## 📈 Continuous Integration

These tests can be integrated into CI/CD pipelines to ensure:

- **Code quality** is maintained
- **Bugs are caught early** before deployment
- **Refactoring is safe** with regression tests
- **New features work correctly** with existing functionality

## 🔍 Manual Testing Checklist

While automated tests are great, also manually test:

- [ ] **Passcode Lock**: Enter correct/incorrect passcodes
- [ ] **Add Product**: Create products with various data
- [ ] **Create Sale**: Add items, set cash/credit amounts
- [ ] **Credit Tracking**: Add standalone credits, verify they appear
- [ ] **Payment Recording**: Record payments against credits
- [ ] **Data Export**: Export products to CSV
- [ ] **Data Import**: Import products from CSV
- [ ] **Filtering**: Test all filter combinations
- [ ] **Responsive Design**: Test on mobile devices

## 🎉 Success Metrics

A successful test suite should:

- ✅ **100% pass rate** on all tests
- ✅ **>80% code coverage** for critical functions
- ✅ **No false positives** (tests that fail when code is correct)
- ✅ **Fast execution** (<30 seconds for full suite)
- ✅ **Clear error messages** when tests fail 