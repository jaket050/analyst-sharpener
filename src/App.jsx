import { useState, useEffect, useCallback } from "react";

const C = {
  bg: "#080810", surface: "#0f0f1a", card: "#13131f", border: "#1c1c2e",
  accent: "#f5c542", text: "#e4e4f0", muted: "#55556a",
  sql: "#4fc3f7", excel: "#4ade80", tableau: "#c084fc", python: "#fb923c",
  ok: "#4ade80", err: "#f87171", warn: "#fbbf24",
};
const mono = "'DM Mono', monospace";
const sans = "'DM Sans', sans-serif";

const MODULES = [
  { id: "sql",     label: "SQL",     color: C.sql,     icon: "⬡" },
  { id: "excel",   label: "Excel",   color: C.excel,   icon: "◈" },
  { id: "tableau", label: "Tableau", color: C.tableau, icon: "◉" },
  { id: "python",  label: "Python",  color: C.python,  icon: "◆" },
];

// ── EXPANDED QUESTION BANK ────────────────────────────────────────────────────

const FLASHCARDS = {
  sql: [
    // Basic
    { level: "Basic", q: "What is the difference between WHERE and HAVING?", a: "WHERE filters rows before grouping. HAVING filters after aggregation. You cannot use aggregate functions like COUNT() or SUM() in WHERE — use HAVING for that." },
    { level: "Basic", q: "Explain INNER JOIN vs LEFT JOIN vs FULL OUTER JOIN.", a: "INNER JOIN returns only matching rows. LEFT JOIN returns all left rows plus matches from right (NULLs where no match). FULL OUTER JOIN returns all rows from both sides with NULLs where no match." },
    { level: "Basic", q: "What does NULL mean in SQL and how do you check for it?", a: "NULL means the absence of a value — not zero, not empty string. Use IS NULL or IS NOT NULL. You cannot use = NULL because NULL compared to anything returns UNKNOWN." },
    { level: "Basic", q: "What is the difference between DELETE, TRUNCATE, and DROP?", a: "DELETE removes specific rows and can be rolled back. TRUNCATE removes all rows fast and is usually not rollback-safe. DROP removes the entire table structure and data permanently." },
    { level: "Basic", q: "What is the difference between a primary key and a foreign key?", a: "A primary key uniquely identifies each row in a table — cannot be NULL or duplicate. A foreign key references a primary key in another table to enforce referential integrity between tables." },
    { level: "Basic", q: "What does DISTINCT do and when would you use it?", a: "DISTINCT removes duplicate rows from a result set. Use it when you need unique values — e.g. SELECT DISTINCT customer_id FROM orders. Be cautious on large tables as it adds a sort/dedup step." },
    { level: "Basic", q: "What is the difference between CHAR and VARCHAR?", a: "CHAR is fixed-length — always uses declared space (CHAR(10) always uses 10 bytes). VARCHAR is variable-length — uses only what it needs plus a small overhead. Use VARCHAR for variable text, CHAR for fixed codes like state abbreviations." },
    { level: "Basic", q: "What does the LIKE operator do? What do % and _ mean?", a: "LIKE performs pattern matching. % matches any sequence of characters (WHERE name LIKE 'A%' finds names starting with A). _ matches exactly one character. Use for flexible text searches." },
    { level: "Basic", q: "What is a self join and when would you use one?", a: "A self join joins a table to itself using an alias. Use it when rows in a table reference other rows in the same table — e.g. finding employees and their managers when both are in the same employees table." },
    { level: "Basic", q: "What is the difference between UNION and JOIN?", a: "UNION stacks result sets vertically — combining rows from two queries with the same columns. JOIN combines tables horizontally — merging columns based on a matching condition. They solve completely different problems." },
    // Intermediate
    { level: "Intermediate", q: "What is the difference between RANK(), DENSE_RANK(), and ROW_NUMBER()?", a: "ROW_NUMBER() gives unique sequential numbers. RANK() gives ties the same rank and skips next (1,1,3). DENSE_RANK() gives ties the same rank without skipping (1,1,2). All require OVER() clause." },
    { level: "Intermediate", q: "What is a CTE and when would you use one over a subquery?", a: "A CTE (Common Table Expression) is a named temporary result defined with WITH. Use it over subqueries for readability, when you need to reference the logic multiple times, or for recursive queries." },
    { level: "Intermediate", q: "What is the difference between UNION and UNION ALL?", a: "UNION removes duplicate rows from the combined result. UNION ALL keeps all rows including duplicates and is faster because it skips the deduplication step." },
    { level: "Intermediate", q: "What is a window function? Give an example.", a: "A window function performs a calculation across a set of rows related to the current row without collapsing them into one. Example: SUM(sales) OVER (PARTITION BY region ORDER BY date) gives a running total per region." },
    { level: "Intermediate", q: "What does COALESCE do and give a real use case.", a: "COALESCE returns the first non-NULL value from a list of arguments. Real use case: COALESCE(phone_mobile, phone_home, 'No phone') — returns the first available phone number or a default string." },
    { level: "Intermediate", q: "What is the difference between EXISTS and IN?", a: "IN checks if a value matches a list — can be slow on large subquery results. EXISTS checks if a subquery returns any rows — stops at first match, making it faster for large datasets. EXISTS is generally preferred for correlated subqueries." },
    { level: "Intermediate", q: "What is a correlated subquery?", a: "A correlated subquery references a column from the outer query and is re-executed for each row of the outer query. It is slower than a regular subquery but useful when you need row-by-row comparison — e.g. finding employees who earn above their department average." },
    { level: "Intermediate", q: "Explain the difference between aggregate and non-aggregate window functions.", a: "Aggregate window functions (SUM, AVG, COUNT with OVER) compute totals across partitions without collapsing rows. Non-aggregate window functions (RANK, LAG, LEAD, NTILE) provide ranking and offset calculations. Both keep every row in the result." },
    { level: "Intermediate", q: "What does LAG() and LEAD() do in SQL?", a: "LAG() accesses the value from a previous row in the result set. LEAD() accesses the value from a following row. Both use OVER() with ORDER BY. Common use: calculating month-over-month change — LAG(sales, 1) OVER (ORDER BY month)." },
    { level: "Intermediate", q: "What is normalization and why does it matter?", a: "Normalization organizes database tables to reduce redundancy and improve integrity. 1NF: atomic values, no repeating groups. 2NF: no partial dependencies on composite keys. 3NF: no transitive dependencies. It reduces update anomalies at the cost of more joins." },
    // Advanced
    { level: "Advanced", q: "What is query optimization and name 3 techniques?", a: "Query optimization improves execution speed. Techniques: create indexes on WHERE/JOIN/ORDER BY columns, avoid SELECT *, filter early to reduce rows, avoid functions on indexed columns in WHERE, use EXISTS over IN for large datasets." },
    { level: "Advanced", q: "What is the difference between OLTP and OLAP?", a: "OLTP handles real-time transactional operations optimized for small fast queries. OLAP handles large-scale analytical queries over historical data. Data warehouses like Snowflake and BigQuery are OLAP systems." },
    { level: "Advanced", q: "What is an execution plan and how do you use it?", a: "An execution plan shows how the database engine will execute a query — which indexes it uses, join types, scan types, and estimated costs. Use EXPLAIN or EXPLAIN ANALYZE to view it. Look for full table scans and high-cost operations to optimize." },
    { level: "Advanced", q: "What is a covering index?", a: "A covering index includes all columns needed to satisfy a query so the database never needs to access the main table. Example: an index on (customer_id, sale_amount) can cover SELECT sale_amount FROM orders WHERE customer_id = 5 entirely from the index." },
    { level: "Advanced", q: "What is the difference between a clustered and non-clustered index?", a: "A clustered index determines the physical sort order of table data — there can be only one per table (usually the primary key). A non-clustered index is a separate structure with pointers back to the main data. Multiple non-clustered indexes can exist per table." },
    { level: "Advanced", q: "What is a recursive CTE and when would you use one?", a: "A recursive CTE references itself to iterate through hierarchical data. It has an anchor member (base case) and a recursive member joined with UNION ALL. Use for org charts, bill of materials, folder structures — any parent-child hierarchy." },
    { level: "Advanced", q: "Explain database transactions and ACID properties.", a: "A transaction is a unit of work that must fully complete or fully roll back. ACID: Atomicity (all or nothing), Consistency (data stays valid), Isolation (concurrent transactions don't interfere), Durability (committed changes persist). Use BEGIN/COMMIT/ROLLBACK to control transactions." },
    { level: "Advanced", q: "What is a materialized view and how does it differ from a regular view?", a: "A regular view is a saved query that runs fresh each time it is accessed. A materialized view stores the query result physically on disk and must be refreshed. Materialized views are faster to query but can be stale — ideal for pre-aggregated reporting tables." },
  ],

  excel: [
    // Basic
    { level: "Basic", q: "What is the difference between VLOOKUP and INDEX/MATCH?", a: "VLOOKUP only looks left-to-right and requires the lookup column to be first. INDEX/MATCH can look in any direction, does not break when columns are inserted, and is faster on large datasets." },
    { level: "Basic", q: "What does a PivotTable do and when should you use one?", a: "A PivotTable dynamically summarizes data by grouping, summing, counting, or averaging without writing formulas. Use it to quickly slice data by categories, compare groups, or build summary reports." },
    { level: "Basic", q: "What is the difference between absolute and relative cell references?", a: "Relative references (A1) adjust when copied. Absolute references ($A$1) stay fixed. Use F4 to toggle. Use absolute references when a formula must always point to a fixed cell like a tax rate." },
    { level: "Basic", q: "What does IFERROR do and what is the difference between IFERROR and IFNA?", a: "IFERROR catches all error types and returns a custom value. IFNA only catches #N/A errors. Use IFNA when you want other errors like #DIV/0! to still surface so real problems are visible." },
    { level: "Basic", q: "What is the difference between COUNT, COUNTA, and COUNTBLANK?", a: "COUNT counts only numeric values. COUNTA counts all non-empty cells including text. COUNTBLANK counts empty cells. Use COUNTA when your data includes text fields you want to count." },
    { level: "Basic", q: "What does SUMIF do and how does it differ from SUMIFS?", a: "SUMIF sums values that meet a single condition: =SUMIF(range, criteria, sum_range). SUMIFS handles multiple conditions: =SUMIFS(sum_range, range1, criteria1, range2, criteria2). Use SUMIFS for multi-condition aggregation." },
    { level: "Basic", q: "What is conditional formatting and when would you use it?", a: "Conditional formatting automatically changes cell appearance based on values or rules — colors, icons, data bars. Use it to highlight outliers, flag negatives, show heat maps, or visually rank data without writing formulas." },
    { level: "Basic", q: "What does the TEXT function do? Give an example.", a: "TEXT converts a number or date to formatted text. Example: =TEXT(A1,'$#,##0.00') displays a number as currency. =TEXT(TODAY(),'MMM DD YYYY') formats today's date as text. Use it when you need formatted values inside concatenated strings." },
    // Intermediate
    { level: "Intermediate", q: "What is Power Query and how does it differ from formulas?", a: "Power Query is a data transformation engine connecting to external sources, cleaning and reshaping data through repeatable steps. Unlike formulas, it handles millions of rows, is auditable, and refreshes automatically from source." },
    { level: "Intermediate", q: "What does XLOOKUP do and how is it better than VLOOKUP?", a: "XLOOKUP searches any range and returns any column — not just to the right. It handles not-found cases natively with a default value argument, works with vertical and horizontal lookups, and does not break when columns shift. Available in Excel 365/2021+." },
    { level: "Intermediate", q: "What is a named range and why would you use one?", a: "A named range assigns a descriptive label to a cell or range (e.g. 'TaxRate' for C2). Formulas using names like =A2*TaxRate are easier to read and maintain than =A2*$C$2. Use them for frequently referenced constants or lookup tables." },
    { level: "Intermediate", q: "What does OFFSET do and when is it useful?", a: "OFFSET returns a reference to a range that is a specified number of rows and columns from a starting cell. Useful for dynamic ranges that grow with data — e.g. creating a chart range that automatically expands when new rows are added." },
    { level: "Intermediate", q: "What is a slicer in Excel and how does it work?", a: "A slicer is a visual filter button panel connected to a PivotTable or Table. Clicking slicer buttons filters the PivotTable interactively. Multiple slicers can be connected to multiple PivotTables simultaneously for dashboard-style filtering." },
    { level: "Intermediate", q: "What is the difference between a Table (Ctrl+T) and a regular range?", a: "An Excel Table auto-expands when rows are added, uses structured references (Table1[Sales]) instead of cell addresses, auto-fills formulas down, and works better with PivotTables and Power Query. Regular ranges require manual updates." },
    // Advanced
    { level: "Advanced", q: "What are array formulas and when do you use them?", a: "Array formulas perform multiple calculations on one or more items in an array. In older Excel, entered with Ctrl+Shift+Enter. In Excel 365, dynamic arrays spill results automatically. Use for multi-condition aggregations, matrix math, or operations that require evaluating entire ranges at once." },
    { level: "Advanced", q: "What is Power Pivot and how does it extend Excel?", a: "Power Pivot is an in-memory data modeling engine inside Excel. It handles tens of millions of rows, creates relationships between tables (like a mini-database), and uses DAX (Data Analysis Expressions) for advanced calculations. It turns Excel into a proper BI tool." },
    { level: "Advanced", q: "What is DAX and name two common DAX functions?", a: "DAX (Data Analysis Expressions) is the formula language for Power Pivot and Power BI. Key functions: CALCULATE() — modifies filter context for a calculation. RELATED() — retrieves values from related tables. It is more powerful than Excel formulas for working across multiple data tables." },
  ],

  tableau: [
    // Basic
    { level: "Basic", q: "What is the difference between a dimension and a measure in Tableau?", a: "Dimensions are categorical fields used to group or slice data (Region, Category). Measures are numeric fields that get aggregated (Sales, Profit). Tableau auto-categorizes but you can override." },
    { level: "Basic", q: "What is a calculated field in Tableau? Give an example.", a: "A calculated field creates a new field using a formula. Example: [Profit Margin] = SUM([Profit]) / SUM([Sales]). It can be used like any other field in visualizations." },
    { level: "Basic", q: "What is the difference between a live connection and an extract?", a: "Live connections query the source in real time — always current but dependent on database speed. Extracts are local snapshots optimized for Tableau — faster but require scheduled refreshes." },
    { level: "Basic", q: "What are filters in Tableau and what is the order of operations?", a: "Tableau applies filters in this order: Extract → Data Source → Context → Sets/Top N → Dimension → Measure → Table Calc → Trend/Reference. Understanding this order explains why a filter may or may not affect a calculation." },
    { level: "Basic", q: "What is a context filter and why would you use one?", a: "A context filter creates a temporary table from filtered data that all other filters and calculations run against. Use it to make Top N filters work correctly — without a context filter, Top N applies before other filters, giving wrong results." },
    { level: "Basic", q: "What is the Marks card and what does each property control?", a: "The Marks card controls how data is visualized. Color encodes a field by hue. Size changes mark size. Label adds text to marks. Detail adds granularity without a visual encoding. Tooltip controls hover text. Shape changes mark shape for scatter plots." },
    { level: "Basic", q: "What is a dashboard in Tableau and how does it differ from a worksheet?", a: "A worksheet is a single visualization. A dashboard combines multiple worksheets and objects (text, images, web pages) into one interactive view. Dashboards support actions — clicking a mark in one chart can filter other charts on the same dashboard." },
    { level: "Basic", q: "What is the difference between discrete and continuous fields in Tableau?", a: "Discrete fields (blue pills) create headers and divide the view into separate sections. Continuous fields (green pills) create axes with a continuous range. Dates can be either — discrete dates group by period, continuous dates plot along an axis." },
    // Intermediate
    { level: "Intermediate", q: "What are LOD expressions and what do FIXED, INCLUDE, and EXCLUDE do?", a: "LOD expressions control calculation granularity independently of the view. FIXED computes at a specified dimension regardless of filters. INCLUDE adds granularity. EXCLUDE removes it from the current view level." },
    { level: "Intermediate", q: "What are Table Calculations and how do they differ from LOD expressions?", a: "Table Calculations compute using data already in the view after aggregation. LOD expressions compute at the data source level before rendering. Table Calculations are ideal for running totals, percent of total, and rank within the view." },
    { level: "Intermediate", q: "What is a parameter in Tableau and how do you use one?", a: "A parameter is a user-controllable input value that can replace a constant in a calculation, filter, or reference line. Example: a parameter letting users choose which metric to display on a chart, used inside a CASE statement in a calculated field." },
    { level: "Intermediate", q: "What is a Set in Tableau and how does it differ from a filter?", a: "A Set is a custom field that defines a subset of members — either fixed (manually selected) or dynamic (condition-based). Unlike filters which remove data, Sets create an in/out field you can use in calculations, colors, and axes to compare the set against everything else." },
    { level: "Intermediate", q: "What does the WINDOW_SUM() function do?", a: "WINDOW_SUM() computes the sum across a window of rows defined by partition and addressing. Example: WINDOW_SUM(SUM([Sales])) sums all values in the current table scope. It is a Table Calculation — different from SUM() which aggregates to the current level of detail." },
    { level: "Intermediate", q: "What is a blended data source in Tableau and when would you use it?", a: "Data blending joins data from two different sources at the aggregate level in the view — unlike joins which happen at the row level. Use blending when your data sources cannot be joined natively, e.g. a database and an Excel file, using a linking field common to both." },
    // Advanced
    { level: "Advanced", q: "What is the difference between FIXED LOD and a context filter?", a: "FIXED LOD ignores all dimension filters unless they are promoted to context filters. A context filter creates a filtered data pool that FIXED LOD respects. If your FIXED LOD is returning unexpected results, check whether you need a context filter to make dimension filters apply." },
    { level: "Advanced", q: "How do dashboard actions work and name three types?", a: "Dashboard actions create interactivity between sheets. Filter actions — clicking a mark filters other sheets. Highlight actions — clicking marks related data. URL actions — clicking opens a web page or passes values to a URL. Set actions — clicking updates a set dynamically." },
    { level: "Advanced", q: "What is a dual axis chart and when would you use one?", a: "A dual axis chart overlays two independent axes on the same view — useful for comparing metrics with different scales on one chart, like revenue (bars) and growth rate (line). Synchronize axes when the scales should align; leave independent when they should not." },
  ],

  python: [
    // Basic
    { level: "Basic", q: "What is the difference between a list and a tuple in Python?", a: "Lists are mutable (can change after creation) using []. Tuples are immutable (cannot change) using (). Use tuples for fixed data like config values. Lists for collections you need to modify." },
    { level: "Basic", q: "What does .groupby() do in Pandas and how does it work?", a: "groupby() splits a DataFrame into groups by one or more columns, applies an aggregation function to each group, then combines results. Example: df.groupby('Region')['Sales'].sum() returns total sales per region." },
    { level: "Basic", q: "What is the difference between .loc[] and .iloc[] in Pandas?", a: ".loc[] selects by label — row index names and column names. .iloc[] selects by integer position — 0-based row and column numbers. Use .loc[] for named indexes, .iloc[] when you need positional slicing like the first 5 rows." },
    { level: "Basic", q: "What does .value_counts() do in Pandas?", a: ".value_counts() returns a Series with counts of unique values, sorted descending by default. Example: df['Region'].value_counts() shows how many rows exist per region. Add normalize=True to get proportions instead of counts." },
    { level: "Basic", q: "What is the difference between .copy() and assignment in Pandas?", a: "Assigning a DataFrame with df2 = df1 creates a view — changes to df2 can affect df1. Using df2 = df1.copy() creates an independent copy. Always use .copy() when you want to modify a subset without affecting the original." },
    { level: "Basic", q: "What does .dropna() do and what are its key parameters?", a: ".dropna() removes rows or columns with missing values. Key params: axis=0 drops rows (default), axis=1 drops columns. how='any' drops if any value is NaN. how='all' drops only if all values are NaN. subset=['col'] limits checking to specific columns." },
    { level: "Basic", q: "What is the difference between .apply() and .map() in Pandas?", a: ".map() works element-wise on a Series — best for simple value substitutions or transformations. .apply() is more flexible — works on Series or DataFrames, row-wise or column-wise, and handles complex logic. .map() is faster for simple cases." },
    { level: "Basic", q: "What is a lambda function and when do you use one?", a: "A lambda is an anonymous single-expression function. Syntax: lambda x: x * 2. Use for short one-off transformations inside .apply(), .map(), or sorted() when a full function definition would be unnecessary overhead." },
    // Intermediate
    { level: "Intermediate", q: "What are list comprehensions and why are they preferred over loops?", a: "List comprehensions build lists in one readable line: [x*2 for x in range(10) if x%2==0]. They are faster than equivalent for-loops because they are C-optimized in Python. Use loops when logic is too complex for one line." },
    { level: "Intermediate", q: "What is the difference between .merge() and .join() in Pandas?", a: ".merge() works like SQL JOINs with explicit control over keys and join type. .join() is a shortcut that joins on index by default. Use .merge() in production pipelines for clarity and control." },
    { level: "Intermediate", q: "What is vectorization in Pandas and why does it matter?", a: "Vectorization applies operations to entire arrays at once using NumPy — 10x-100x faster than .apply() or .iterrows(). Always prefer df['col'] * 2 over row-level loops." },
    { level: "Intermediate", q: "What does .pivot_table() do in Pandas?", a: ".pivot_table() creates a spreadsheet-style pivot summary. Parameters: values (what to aggregate), index (row grouping), columns (column grouping), aggfunc (how to aggregate — default is mean). Example: pd.pivot_table(df, values='Sales', index='Region', columns='Quarter', aggfunc='sum')." },
    { level: "Intermediate", q: "What is the difference between wide and long format data? How do you convert between them?", a: "Wide format has one row per subject with multiple columns for observations. Long format has one row per observation. Use pd.melt() to go wide-to-long (unpivot). Use .pivot() or .pivot_table() to go long-to-wide. Long format is preferred for most analytical tools." },
    { level: "Intermediate", q: "What does pd.concat() do and how is it different from merge?", a: "pd.concat() stacks DataFrames along an axis — vertically (axis=0, adding rows) or horizontally (axis=1, adding columns). merge() combines DataFrames based on matching key values. Use concat() to combine same-schema data from multiple sources." },
    { level: "Intermediate", q: "What are try/except blocks and why are they important in data pipelines?", a: "try/except handles errors gracefully without crashing the program. In data pipelines they catch issues like missing files, bad API responses, or malformed rows. Always catch specific exceptions (FileNotFoundError, ValueError) rather than bare except — bare except hides bugs." },
    { level: "Intermediate", q: "What is the difference between a dictionary and a list in Python?", a: "A list is an ordered sequence accessed by integer index. A dictionary is an unordered (Python 3.7+ preserves insertion order) key-value store accessed by key. Dictionaries have O(1) lookup time. Use dicts when you need fast lookup by a named key rather than position." },
    // Advanced
    { level: "Advanced", q: "What is a generator in Python and when would you use one?", a: "A generator is a function that yields values one at a time using yield instead of returning a list. It uses minimal memory because values are produced on demand. Use generators when processing large files or data streams where loading everything into memory is not feasible." },
    { level: "Advanced", q: "What is the difference between @staticmethod and @classmethod in Python?", a: "@staticmethod does not receive the class or instance — it is a plain function namespaced inside a class. @classmethod receives the class (cls) as its first argument. Use @classmethod for factory methods or when you need to access class-level state." },
    { level: "Advanced", q: "What is method chaining in Pandas and what are its trade-offs?", a: "Method chaining applies multiple operations in sequence: df.dropna().rename(columns={...}).groupby('Region').agg(...).reset_index(). It is readable and avoids intermediate variables. Trade-off: harder to debug because you cannot inspect intermediate states easily. Use .pipe() for complex steps." },
  ],
};

const CODING = {
  sql: [
    { level: "Basic", prompt: "Write a query to find the top 5 customers by total sales.\n\nTable: orders\nColumns: order_id, customer_id, customer_name, sale_amount", solution: "SELECT customer_id, customer_name,\n  SUM(sale_amount) AS total_sales\nFROM orders\nGROUP BY customer_id, customer_name\nORDER BY total_sales DESC\nLIMIT 5;", hint: "Aggregate → group → sort → limit" },
    { level: "Basic", prompt: "Find all customers who have never placed an order.\n\nTables:\n  customers (customer_id, name)\n  orders (order_id, customer_id, order_date)", solution: "SELECT c.customer_id, c.name\nFROM customers c\nLEFT JOIN orders o ON c.customer_id = o.customer_id\nWHERE o.customer_id IS NULL;", hint: "LEFT JOIN + WHERE NULL on the right side = unmatched rows" },
    { level: "Intermediate", prompt: "Rank employees by salary within each department.\n\nTable: employees\nColumns: emp_id, name, department, salary", solution: "SELECT\n  emp_id, name, department, salary,\n  RANK() OVER (\n    PARTITION BY department\n    ORDER BY salary DESC\n  ) AS salary_rank\nFROM employees;", hint: "PARTITION BY groups, ORDER BY sets direction" },
    { level: "Intermediate", prompt: "Calculate a 3-month rolling average of monthly sales.\n\nTable: monthly_sales\nColumns: month (DATE), total_sales", solution: "SELECT\n  month,\n  total_sales,\n  AVG(total_sales) OVER (\n    ORDER BY month\n    ROWS BETWEEN 2 PRECEDING AND CURRENT ROW\n  ) AS rolling_3mo_avg\nFROM monthly_sales\nORDER BY month;", hint: "ROWS BETWEEN 2 PRECEDING AND CURRENT ROW defines the window frame" },
    { level: "Advanced", prompt: "Using a CTE, find customers who ordered in BOTH January AND February 2024.\n\nTable: orders\nColumns: order_id, customer_id, order_date", solution: "WITH jan AS (\n  SELECT DISTINCT customer_id\n  FROM orders\n  WHERE YEAR(order_date) = 2024\n    AND MONTH(order_date) = 1\n),\nfeb AS (\n  SELECT DISTINCT customer_id\n  FROM orders\n  WHERE YEAR(order_date) = 2024\n    AND MONTH(order_date) = 2\n)\nSELECT j.customer_id\nFROM jan j\nINNER JOIN feb f ON j.customer_id = f.customer_id;", hint: "Two CTEs, one per month, INNER JOIN to find overlap" },
    { level: "Advanced", prompt: "Write a query to detect duplicate records in a table.\n\nTable: customers\nColumns: customer_id, email, name\n\nFind emails that appear more than once.", solution: "SELECT\n  email,\n  COUNT(*) AS occurrences,\n  MIN(customer_id) AS keep_id\nFROM customers\nGROUP BY email\nHAVING COUNT(*) > 1\nORDER BY occurrences DESC;", hint: "GROUP BY the duplicate field, HAVING COUNT > 1 finds the dupes" },
  ],
  python: [
    { level: "Basic", prompt: "Write a one-liner list comprehension returning only even numbers squared.\n\nnumbers = [1, 2, 3, 4, 5, 6, 7, 8]\nExpected: [4, 16, 36, 64]", solution: "result = [x**2 for x in numbers if x % 2 == 0]", hint: "Filter with 'if x % 2 == 0', transform with x**2" },
    { level: "Basic", prompt: "Write a function that takes a list of numbers and returns a dict with keys 'mean', 'min', and 'max'.\n\nDo not use Pandas — use Python builtins only.", solution: "def summarize(nums):\n    return {\n        'mean': sum(nums) / len(nums),\n        'min': min(nums),\n        'max': max(nums)\n    }", hint: "sum()/len() for mean, built-in min() and max()" },
    { level: "Intermediate", prompt: "Group a DataFrame by 'Region', return avg Sales and order count per region, sorted by avg_sales descending.\n\nDataFrame: df\nColumns: Region, Sales", solution: "result = (\n  df.groupby('Region')['Sales']\n  .agg(avg_sales='mean', order_count='count')\n  .reset_index()\n  .sort_values('avg_sales', ascending=False)\n)", hint: "Use .agg() with named aggregations, then sort_values" },
    { level: "Intermediate", prompt: "Clean a DataFrame by:\n1. Dropping rows where 'Revenue' is null\n2. Filling 'Region' nulls with 'Unknown'\n3. Removing duplicate rows\n\nDataFrame: df\nColumns: customer_id, Region, Revenue", solution: "df_clean = (\n  df\n  .dropna(subset=['Revenue'])\n  .fillna({'Region': 'Unknown'})\n  .drop_duplicates()\n  .reset_index(drop=True)\n)", hint: "Chain dropna → fillna → drop_duplicates" },
    { level: "Advanced", prompt: "Write a function that reads a CSV, filters rows where 'status' is 'active', groups by 'category', and returns total 'revenue' per category as a dictionary.\n\nUse Pandas. Handle FileNotFoundError gracefully.", solution: "import pandas as pd\n\ndef revenue_by_category(filepath):\n    try:\n        df = pd.read_csv(filepath)\n        result = (\n            df[df['status'] == 'active']\n            .groupby('category')['revenue']\n            .sum()\n            .to_dict()\n        )\n        return result\n    except FileNotFoundError:\n        print(f'File not found: {filepath}')\n        return {}", hint: "try/except wraps read_csv, filter before groupby, .to_dict() at the end" },
  ],
  excel: [
    { level: "Basic", prompt: "Write an Excel formula to look up a customer's region from a reference table.\n\nLookup value: A2\nLookup table: Sheet2!A:C\nRegion is in column 3\nUse exact match", solution: "=VLOOKUP(A2, Sheet2!A:C, 3, FALSE)\n\n-- Preferred (more robust):\n=INDEX(Sheet2!C:C, MATCH(A2, Sheet2!A:A, 0))", hint: "VLOOKUP 4th arg FALSE = exact match. INDEX/MATCH doesn't break on column shifts." },
    { level: "Intermediate", prompt: "Write a formula that returns 'High' if Sales in B2 > 10000, 'Medium' if > 5000, else 'Low'.", solution: '=IF(B2>10000,"High",IF(B2>5000,"Medium","Low"))\n\n-- Excel 2019+ alternative:\n=IFS(B2>10000,"High",B2>5000,"Medium",TRUE,"Low")', hint: "Nested IF evaluates outer condition first. IFS is cleaner for 3+ conditions." },
    { level: "Advanced", prompt: "Write a formula to count the number of unique customers in column A who made a purchase over $500 (column B).\n\nDo not use a helper column.", solution: "=SUMPRODUCT((B2:B100>500)/COUNTIF(A2:A100,A2:A100))\n\n-- Excel 365 alternative:\n=COUNTA(UNIQUE(FILTER(A2:A100, B2:B100>500)))", hint: "SUMPRODUCT with COUNTIF handles unique counting in older Excel. UNIQUE+FILTER in 365." },
  ],
  tableau: [
    { level: "Basic", prompt: "Write a Tableau calculated field for Profit Margin as a percentage.\n\nAvailable fields: [Sales], [Profit]", solution: "SUM([Profit]) / SUM([Sales])\n\n-- Format as Percentage in the Format pane.\n-- Always wrap measures in SUM() to avoid row-level vs aggregate errors.", hint: "Use SUM() around both. Format as % in Format pane." },
    { level: "Intermediate", prompt: "Write a FIXED LOD to calculate each customer's total lifetime sales, independent of view filters.\n\nFields: [Customer ID], [Sales]", solution: "{ FIXED [Customer ID] : SUM([Sales]) }\n\n-- This computes total sales per customer independent of view-level filters.\n-- Promote dimension filters to context if you need them to affect FIXED LODs.", hint: "FIXED ignores view filters. Syntax: { FIXED [dim] : AGG([measure]) }" },
    { level: "Advanced", prompt: "Write a calculated field that classifies each customer as 'High Value', 'Mid Value', or 'Low Value' based on their FIXED lifetime sales:\n  High: > 10000\n  Mid: > 3000\n  Low: otherwise", solution: "IF { FIXED [Customer ID] : SUM([Sales]) } > 10000\nTHEN 'High Value'\nELSEIF { FIXED [Customer ID] : SUM([Sales]) } > 3000\nTHEN 'Mid Value'\nELSE 'Low Value'\nEND", hint: "Nest the FIXED LOD inside an IF/ELSEIF/ELSE block" },
  ],
};

const QUICKFIRE = [
  { q: "What does NULL mean in SQL?", a: "The absence of a value — not zero, not empty string. NULL is unknown." },
  { q: "SQL clause execution order?", a: "FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT" },
  { q: "What does COALESCE do?", a: "Returns the first non-NULL value from a list of arguments." },
  { q: "UNION vs UNION ALL?", a: "UNION removes duplicates. UNION ALL keeps all rows — and is faster." },
  { q: "What is a primary key?", a: "A column that uniquely identifies each row. Cannot be NULL or duplicate." },
  { q: "What is a foreign key?", a: "A column referencing a primary key in another table — enforces referential integrity." },
  { q: "pd.merge() default join type?", a: "Inner join — only rows with matching keys in both DataFrames appear." },
  { q: "What does .fillna() do?", a: "Replaces NaN/NULL values with a specified value or fill method (ffill, bfill)." },
  { q: "Measure vs dimension in Tableau?", a: "Measure = numeric aggregatable (Sales). Dimension = categorical grouping field (Region)." },
  { q: "What does DENSE_RANK() do vs RANK()?", a: "DENSE_RANK gives tied rows the same rank without skipping. RANK() skips the next number." },
  { q: "Absolute cell reference in Excel?", a: "A reference locked with $ signs ($A$1) that does not change when the formula is copied." },
  { q: "VLOOKUP 4th argument?", a: "Exact or approximate match. Use FALSE or 0 for exact match — almost always required." },
  { q: "What is vectorization in Pandas?", a: "Applying operations to entire arrays at once via NumPy — 10-100x faster than row loops." },
  { q: "What is an index in SQL?", a: "A data structure that speeds up retrieval by providing fast lookup paths — like a book index." },
  { q: "What does GROUP BY do?", a: "Groups rows sharing the same value so aggregate functions can be applied per group." },
  { q: "What is a CTE?", a: "Common Table Expression — a named temporary result set defined with WITH for readability and reuse." },
  { q: "What does LAG() do in SQL?", a: "Accesses the value from a previous row in the result set. Used for period-over-period comparisons." },
  { q: "What is the difference between .loc and .iloc?", a: ".loc uses label-based indexing (column/row names). .iloc uses integer-position indexing (0-based)." },
  { q: "What is a context filter in Tableau?", a: "A filter that creates a temporary data pool all other filters run against. Required for correct Top N filtering." },
  { q: "What does IFERROR do in Excel?", a: "Wraps a formula and returns a custom value if it produces any error type — keeps dashboards clean." },
  { q: "What is a LEFT JOIN?", a: "Returns all rows from the left table plus matching rows from the right. NULLs where no match exists." },
  { q: "What is normalization?", a: "Organizing tables to reduce redundancy by splitting data into related tables with clear relationships." },
  { q: "What does .dropna() do?", a: "Removes rows (or columns) containing NaN/NULL values. Control with axis, how, and subset params." },
  { q: "What is XLOOKUP?", a: "Excel 365 function that replaces VLOOKUP — searches any direction, handles not-found natively, doesn't break on column shifts." },
  { q: "What is a materialized view?", a: "A view that stores its query result physically on disk for fast reads — must be refreshed to stay current." },
];

// ── DOMAIN PACKS ──────────────────────────────────────────────────────────────

const DOMAIN_PACKS = {
  boeing: {
    id: "boeing",
    label: "Boeing / Aviation",
    icon: "✈",
    color: "#60a5fa",
    description: "Workforce analytics, maintenance data, flight operations, reliability reporting",
    questions: [
      // Basic
      { level: "Basic", q: "You have a table of aircraft maintenance events with columns: tail_number, event_date, event_type, hours_down. Write a query to find the total downtime hours per aircraft, sorted by most downtime.", a: "SELECT tail_number, SUM(hours_down) AS total_downtime FROM maintenance_events GROUP BY tail_number ORDER BY total_downtime DESC;\n\nThis is a straightforward aggregation. The key is grouping by the unit of analysis (aircraft tail number) and ordering descending to surface the worst performers first." },
      { level: "Basic", q: "What is schedule reliability in aviation analytics and how would you calculate it from a flight operations table?", a: "Schedule reliability = percentage of flights departing within X minutes of scheduled time (typically 15 min). Formula: (on_time_departures / total_departures) * 100. Query: SELECT COUNT(CASE WHEN ABS(actual_dep - scheduled_dep) <= 15 THEN 1 END) * 100.0 / COUNT(*) AS reliability_pct FROM flights." },
      { level: "Basic", q: "A production manager wants to see the daily build rate for a 777 line. Your table has: work_order_id, unit_number, start_date, completion_date. What metric do you calculate and how?", a: "Calculate units completed per day (build rate). SELECT completion_date, COUNT(unit_number) AS units_completed FROM work_orders WHERE completion_date IS NOT NULL GROUP BY completion_date ORDER BY completion_date. Then compute a rolling average to smooth daily variance: AVG(units_completed) OVER (ORDER BY completion_date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) as rolling_7day_rate." },
      { level: "Basic", q: "What is JBS (Job Build Schedule) and why is reducing JBS slippage important as a metric?", a: "JBS tracks whether individual work orders complete within their scheduled time window on the production line. Slippage means a job took longer than planned, cascading delays to downstream operations. Reducing JBS slippage improves line flow, reduces overtime costs, and maintains on-time delivery commitments. As an analyst you'd measure: (actual_completion - scheduled_completion) in hours, then aggregate by work center, shift, or job type to find root cause patterns." },
      { level: "Basic", q: "You have a parts inventory table: part_number, quantity_on_hand, unit_cost, reorder_point. Write a query to flag parts below reorder point and calculate total dollar exposure.", a: "SELECT part_number, quantity_on_hand, reorder_point, unit_cost, (reorder_point - quantity_on_hand) * unit_cost AS dollar_exposure FROM inventory WHERE quantity_on_hand < reorder_point ORDER BY dollar_exposure DESC;\n\nThe dollar exposure calculation helps prioritize which stockouts need immediate attention vs. low-cost items that can wait." },
      { level: "Basic", q: "What is MTBF (Mean Time Between Failures) and how would you calculate it from a maintenance events table?", a: "MTBF = total operating hours / number of failures. It measures reliability — higher MTBF means fewer unplanned failures. SQL: SELECT component_type, SUM(operating_hours) / COUNT(failure_events) AS mtbf_hours FROM maintenance_log WHERE event_type = 'unplanned' GROUP BY component_type. Used to plan preventive maintenance intervals and compare fleet reliability over time." },
      { level: "Basic", q: "A supervisor asks for a report showing each mechanic's work order completion rate this month. What query structure do you use?", a: "SELECT m.mechanic_id, m.name, COUNT(wo.work_order_id) AS assigned, SUM(CASE WHEN wo.status = 'complete' THEN 1 ELSE 0 END) AS completed, ROUND(SUM(CASE WHEN wo.status = 'complete' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) AS completion_rate FROM mechanics m JOIN work_orders wo ON m.mechanic_id = wo.assigned_to WHERE MONTH(wo.due_date) = MONTH(CURRENT_DATE) GROUP BY m.mechanic_id, m.name ORDER BY completion_rate DESC." },
      { level: "Basic", q: "What is inventory turnover and why does it matter in an aerospace manufacturing context?", a: "Inventory turnover = Cost of Goods Sold / Average Inventory Value. In aerospace manufacturing, high turnover means parts move through efficiently without excessive stockpiling (which ties up capital and creates obsolescence risk). Low turnover may indicate overstocking, demand forecast errors, or supplier delivery mismatches. An 8% inventory cost reduction (like reducing excess buffer stock) directly improves this metric." },
      { level: "Basic", q: "You need to compare planned vs. actual labor hours by work center for the current quarter. What columns and aggregation logic do you need?", a: "SELECT work_center, SUM(planned_hours) AS planned, SUM(actual_hours) AS actual, SUM(actual_hours) - SUM(planned_hours) AS variance, ROUND((SUM(actual_hours) - SUM(planned_hours)) / SUM(planned_hours) * 100, 1) AS variance_pct FROM labor_records WHERE quarter = CURRENT_QUARTER GROUP BY work_center ORDER BY variance_pct DESC. Positive variance = over plan (problem). Negative = under plan (efficiency or incomplete work)." },
      { level: "Basic", q: "What does a Gantt chart represent in project analytics, and what data structure underlies it?", a: "A Gantt chart shows tasks on a timeline with start date, end date, duration, and dependencies. The underlying data structure: task_id, task_name, start_date, end_date, predecessor_task_id, percent_complete, assigned_resource. In SQL you'd need self-joins or recursive CTEs to traverse the dependency chain. Analysts use it to identify the critical path — the longest chain of dependent tasks that determines minimum project duration." },
      // Intermediate
      { level: "Intermediate", q: "Write a SQL query to calculate the 30-day rolling average of unplanned maintenance events per aircraft tail number. Table: maintenance_events (tail_number, event_date, event_type).", a: "SELECT tail_number, event_date, COUNT(*) OVER (\n  PARTITION BY tail_number\n  ORDER BY event_date\n  ROWS BETWEEN 29 PRECEDING AND CURRENT ROW\n) AS rolling_30day_unplanned\nFROM maintenance_events\nWHERE event_type = 'unplanned'\nORDER BY tail_number, event_date;\n\nThe window frame ROWS BETWEEN 29 PRECEDING AND CURRENT ROW gives exactly 30 days of history including today." },
      { level: "Intermediate", q: "Your production data shows work orders are consistently slipping on Wing Assembly but not on Final Assembly. How do you structure an analysis to find root cause?", a: "Segment the problem: (1) Filter maintenance_events to Wing Assembly, group by shift, mechanic_team, job_type to find if slippage is concentrated. (2) Correlate with part shortages — join to inventory events on same dates. (3) Check rework rates: jobs with rework flags tend to cascade delays. (4) Compare pre/post any staffing or tooling changes using a before/after date filter. Present findings as: 60% of slippage concentrated in 3 job types → drill into those job types for root cause." },
      { level: "Intermediate", q: "You need to find aircraft that had both a maintenance event AND a schedule disruption within 48 hours of each other. How do you write this query?", a: "SELECT m.tail_number, m.event_date AS maintenance_date, f.flight_date AS disruption_date, DATEDIFF(f.flight_date, m.event_date) AS hours_gap\nFROM maintenance_events m\nJOIN flight_disruptions f ON m.tail_number = f.tail_number\n  AND f.flight_date BETWEEN m.event_date AND DATE_ADD(m.event_date, INTERVAL 48 HOUR)\nWHERE m.event_type = 'unplanned'\nORDER BY m.tail_number, m.event_date;\n\nThis is a non-equi join with a date range condition — common in operations analytics." },
      { level: "Intermediate", q: "How would you build a Tableau dashboard to monitor production line health for a 777 build program? What views would you include?", a: "Key views: (1) Build rate trend — line chart of units completed per week vs. plan. (2) JBS slippage by work center — bar chart with reference line at zero. (3) Top 10 work orders by delay hours — table with drill-down. (4) Labor efficiency — actual vs. planned hours heatmap by shift/day. (5) Part shortage tracker — flagged items with days of supply remaining. Use color coding: green = on plan, yellow = within 5%, red = >5% off. Add filter actions so clicking a work center filters all other views." },
      { level: "Intermediate", q: "What is a LOD expression in Tableau and give a real aviation analytics use case for FIXED.", a: "LOD expressions compute at a granularity you specify, independent of what's in the view. FIXED ignores all dimension filters. Aviation use case: calculating each aircraft's average unplanned events per month regardless of what date range filter the user applies — { FIXED [Tail Number] : AVG([Monthly_Unplanned_Events]) }. This gives a fleet baseline you can compare each aircraft against, even when the user filters to just the last 30 days." },
      { level: "Intermediate", q: "You have 3 years of maintenance data. Leadership wants to know if fleet reliability is improving, holding steady, or degrading. How do you structure this analysis in Python?", a: "import pandas as pd\n\ndf = pd.read_csv('maintenance.csv', parse_dates=['event_date'])\ndf['year_month'] = df['event_date'].dt.to_period('M')\n\n# Monthly unplanned events per aircraft\nmonthly = df[df['event_type']=='unplanned'].groupby('year_month').agg(\n  events=('event_id','count'),\n  fleet_size=('tail_number','nunique')\n).reset_index()\n\nmonthly['events_per_aircraft'] = monthly['events'] / monthly['fleet_size']\nmonthly['rolling_3mo'] = monthly['events_per_aircraft'].rolling(3).mean()\n\n# Trend: compare first year avg vs last year avg\nfirst_yr = monthly.head(12)['events_per_aircraft'].mean()\nlast_yr = monthly.tail(12)['events_per_aircraft'].mean()\nprint(f'Trend: {((last_yr-first_yr)/first_yr)*100:.1f}% change')" },
      { level: "Intermediate", q: "Explain what a waterfall chart shows and describe a Boeing production use case where it would be the right visualization.", a: "A waterfall chart shows how an initial value increases or decreases through a series of intermediate steps to reach a final value. Each bar shows a positive or negative contribution. Boeing use case: showing how the planned 777 build rate of 5 units/month changes to actual 3.8 units/month — broken down by: part shortages (-0.4), rework events (-0.3), tool availability (-0.2), labor callouts (-0.3). Each factor is a bar. Leadership sees exactly which contributors drove the gap, not just the total variance." },
      { level: "Intermediate", q: "Your inventory reduction project claims an 8% cost reduction. How do you validate and measure this in SQL?", a: "Compare average inventory value before and after the project:\nWITH before AS (\n  SELECT AVG(quantity_on_hand * unit_cost) AS avg_inv_value\n  FROM inventory_snapshots\n  WHERE snapshot_date BETWEEN '2022-01-01' AND '2022-12-31'\n),\nafter AS (\n  SELECT AVG(quantity_on_hand * unit_cost) AS avg_inv_value\n  FROM inventory_snapshots\n  WHERE snapshot_date BETWEEN '2023-01-01' AND '2023-12-31'\n)\nSELECT before.avg_inv_value, after.avg_inv_value,\n  (after.avg_inv_value - before.avg_inv_value) / before.avg_inv_value * 100 AS pct_change\nFROM before, after;\n\nAlso validate: same period comparison eliminates seasonality. Compare to control group if available." },
      { level: "Intermediate", q: "What Python library would you use to build a predictive model for unplanned maintenance events, and what features would you engineer from raw maintenance data?", a: "Use scikit-learn. Features to engineer from maintenance data: days_since_last_event (recency), rolling_30day_event_count (frequency), aircraft_age_years, total_flight_hours, component_type_encoded, seasonal_month, days_since_last_inspection. Target variable: unplanned_event_next_30_days (binary). Model: Random Forest or Gradient Boosting (handles non-linear relationships, works with mixed feature types). Validate with time-based train/test split — never shuffle, always split chronologically to avoid data leakage." },
      { level: "Intermediate", q: "How would you use Excel Power Query to consolidate monthly maintenance reports from 12 different work centers into a single analysis-ready table?", a: "In Power Query: (1) Get Data → Folder → point to the folder with all 12 files. (2) Power Query auto-generates a function to load each file. (3) Add a custom column to tag each row with the source filename (work center name). (4) Filter out header rows that repeated across files. (5) Standardize column names using Rename Columns. (6) Set correct data types. (7) Load to Excel table. Key advantage: when new monthly files drop into the folder, click Refresh and the table updates automatically — no manual copy-paste." },
      // Advanced
      { level: "Advanced", q: "Design a data pipeline in Python that ingests daily work order exports from a Boeing MES (Manufacturing Execution System), detects JBS slippage anomalies, and alerts operations managers via a dashboard flag. Walk through the architecture.", a: "Architecture: (1) Ingestion — scheduled Python script (cron/Airflow) reads daily CSV export, validates schema (column presence, date formats, null checks). (2) Transformation — pandas: parse dates, calculate planned vs actual hour variance per work order, flag outliers using z-score or IQR method on historical variance distribution. (3) Storage — write clean data + flags to PostgreSQL staging table. (4) Dashboard — Tableau/Power BI reads from DB, shows red flags on work center heatmap. (5) Alerting — if flagged work orders > threshold, trigger email via SMTP or Slack API. Key design decision: idempotent inserts (ON CONFLICT UPDATE) so re-runs don't duplicate data." },
      { level: "Advanced", q: "You need to build a fleet reliability scoring model that ranks aircraft by risk of unplanned maintenance in the next 30 days. What's your end-to-end approach?", a: "Step 1 — Define target: binary label (unplanned event in next 30 days = 1/0) on rolling monthly windows per aircraft. Step 2 — Feature engineering: recency (days since last unplanned), frequency (events per 100 flight hours), aircraft age, component-level MTBF vs fleet average, seasonal effects. Step 3 — Model: Gradient Boosting (XGBoost) — handles non-linear interactions, outputs probability. Step 4 — Validation: time-series cross-validation (expanding window), evaluate precision/recall at threshold that minimizes missed high-risk aircraft. Step 5 — Deployment: score runs nightly, results push to Tableau dashboard as risk tier (High/Medium/Low) per tail number. Step 6 — Monitor: track model calibration monthly, retrain quarterly." },
      { level: "Advanced", q: "How do you handle slowly changing dimensions in an aviation analytics data warehouse? Give a specific example from fleet or workforce data.", a: "Slowly Changing Dimensions (SCDs) track how dimension attributes change over time. Type 2 SCD is most common in aviation analytics. Example: An aircraft (tail_number) gets reassigned from Domestic to International operations. Type 2 handles this by: adding start_date and end_date columns plus an is_current flag. Old record: end_date set, is_current = false. New record: same tail_number, new operation_type, start_date = reassignment date, end_date = NULL, is_current = true. This preserves historical accuracy — maintenance events before the reassignment correctly join to the 'Domestic' record, not the current 'International' record. Critical for correct trend analysis." },
      { level: "Advanced", q: "A Tableau dashboard is running slowly when users filter by date range on a fleet of 800 aircraft with 5 years of daily data. What are 5 concrete steps to improve performance?", a: "(1) Switch from live connection to extract — daily scheduled refresh is fine for operations dashboards. (2) Pre-aggregate in the data source — instead of row-level daily events, create a summary table at weekly/monthly grain. (3) Use context filters — promote the date filter to context so it runs first and reduces the data pool. (4) Reduce LOD expression scope — if FIXED LODs are computing across 5 years, add a date constraint inside the LOD. (5) Limit marks — cap scatter plots at 5,000 marks max, use aggregated views for overview, drill-down only on demand. Also: check if data blending is happening (expensive) and replace with a join in the data source." },
      { level: "Advanced", q: "Walk through how you would build a Python-based anomaly detection system for production quality metrics on a 777X assembly line.", a: "import pandas as pd\nfrom scipy import stats\nimport numpy as np\n\ndef detect_anomalies(df, metric_col, window=30, threshold=3):\n    df = df.sort_values('date')\n    df['rolling_mean'] = df[metric_col].rolling(window).mean()\n    df['rolling_std'] = df[metric_col].rolling(window).std()\n    df['z_score'] = (df[metric_col] - df['rolling_mean']) / df['rolling_std']\n    df['is_anomaly'] = df['z_score'].abs() > threshold\n    return df\n\n# Usage: detect defect rate spikes\nresult = detect_anomalies(quality_df, 'defect_rate_pct')\nalerts = result[result['is_anomaly']]\nprint(f'{len(alerts)} anomalies detected')\n\nFor production: use CUSUM (cumulative sum) or EWMA (exponentially weighted moving average) for earlier detection of gradual drift — z-score catches spikes but misses slow degradation." },
      { level: "Advanced", q: "What is a star schema and design one for a Boeing production analytics warehouse that supports build rate, labor efficiency, and quality reporting.", a: "A star schema has one central fact table surrounded by dimension tables — no joins between dimensions. Design:\n\nFACT_PRODUCTION: work_order_id (FK), date_id (FK), work_center_id (FK), employee_id (FK), part_id (FK), planned_hours, actual_hours, defects_found, units_completed\n\nDIM_DATE: date_id, date, week, month, quarter, year, shift\nDIM_WORK_CENTER: work_center_id, name, line, building, manager\nDIM_EMPLOYEE: employee_id, name, skill_code, grade, team\nDIM_PART: part_id, part_number, description, category, unit_cost\n\nThis supports: build rate (aggregate units_completed by date), labor efficiency (sum planned vs actual hours by work_center), quality (sum defects by part/work_center). Queries are simple and fast because every analysis is just FACT + one or two DIM joins." },
      { level: "Advanced", q: "You inherit a 15,000-line Excel workbook used for production scheduling at Boeing. Leadership wants it replaced with a proper data solution. How do you approach this migration project?", a: "Phase 1 — Discovery (2 weeks): interview users to understand every tab's purpose, identify inputs vs. outputs, map data sources feeding the workbook. Document all formulas and business rules. Identify the 20% of functionality that drives 80% of decisions. Phase 2 — Design (1 week): choose target stack (SQL database + Python ETL + Tableau or Power BI dashboard). Design data model. Phase 3 — Build parallel (4 weeks): build new solution, run both in parallel, validate outputs match. Phase 4 — Training and cutover (1 week): train users, document new system, decommission Excel after sign-off. Critical success factors: get a power user as champion, don't try to replicate every feature — simplify. Biggest risk: undocumented business logic buried in nested IF formulas." },
      { level: "Advanced", q: "Explain how you would use Python pandas to perform a cohort analysis on Boeing mechanics — tracking first-year retention and productivity by hire cohort.", a: "import pandas as pd\n\n# Load employee data\ndf = pd.read_csv('employees.csv', parse_dates=['hire_date', 'term_date'])\ndf['hire_cohort'] = df['hire_date'].dt.to_period('Q')  # quarterly cohorts\ndf['tenure_days'] = (df['term_date'].fillna(pd.Timestamp.today()) - df['hire_date']).dt.days\ndf['retained_365'] = (df['tenure_days'] >= 365).astype(int)\n\n# Retention by cohort\nretention = df.groupby('hire_cohort').agg(\n  hired=('employee_id','count'),\n  retained_1yr=('retained_365','sum')\n).reset_index()\nretention['retention_rate'] = retention['retained_1yr'] / retention['hired'] * 100\n\n# Join to productivity data for productivity analysis\n# Cohorts with lower retention often show lower productivity in months 6-12\nprint(retention)" },
      { level: "Basic", q: "What is a Gantt chart and how is it used in aerospace production planning? What data fields power one?", a: "A Gantt chart is a horizontal bar chart showing tasks, their durations, and dependencies over time. In aerospace production planning it shows each work order, which work center it runs in, planned start/end dates, and predecessor tasks. Data needed: work_order_id, task_name, work_center, planned_start, planned_end, actual_start, actual_end, predecessor_task_id. Critical path tasks — those where any delay pushes the final delivery date — are highlighted. In Tableau you can build a Gantt using a calculated field for duration: DATEDIFF('day', planned_start, planned_end) placed on the Size shelf." },
      { level: "Basic", q: "You're asked to create a headcount forecast for the 777X production ramp. What data sources and calculation approach would you use?", a: "Data sources: current headcount by work center and skill code, historical units-per-employee ratios by line rate, upcoming production schedule (units per month), planned overtime caps, and attrition rates by classification. Approach: (1) Determine required labor hours = planned_units × hours_per_unit by work center. (2) Convert to FTE: required_hours / available_hours_per_FTE (accounting for PTO, training, utilization). (3) Subtract current headcount to get net hire/reduction needed. (4) Apply attrition rate to existing headcount to get replacement hiring. (5) Model in Excel or Python with scenario toggles for production rate changes. Present as a waterfall: starting headcount → attrition → transfers → new hires → ending headcount." },
      { level: "Intermediate", q: "What is a learning curve in aerospace manufacturing and how would you model it in SQL or Python?", a: "A learning curve (Wright's Law) states that each time cumulative production doubles, unit labor hours decrease by a fixed percentage (e.g. 80% curve means each doubling = 20% reduction). Model in Python:\nimport numpy as np\n\ndef learning_curve(unit_number, first_unit_hours, learning_rate=0.8):\n    # T(n) = T(1) * n^(log(learning_rate)/log(2))\n    b = np.log(learning_rate) / np.log(2)\n    return first_unit_hours * (unit_number ** b)\n\nunits = range(1, 501)\nforecasted_hours = [learning_curve(u, first_unit_hours=10000) for u in units]\n\nIn SQL, validate actual vs. modeled: compare actual_hours_per_unit to the curve forecast by unit_number to see if the line is on, ahead, or behind the learning curve. Deviation above the curve = rework, tooling issues, or workforce disruption." },
      { level: "Intermediate", q: "Your team lead asks you to build a KPI dashboard for the 777 production line. Name 6 KPIs, their calculation, and what a healthy target looks like for each.", a: "(1) Build Rate: units completed per month. Target: ≥ plan (e.g. 5/month). (2) JBS Adherence: % work orders completing within scheduled window. Target: ≥ 95%. (3) Labor Efficiency: planned hours / actual hours × 100. Target: 95–105% (under 90% = efficiency problem, over 110% = unrealistic plans). (4) First-Pass Quality: % units passing inspection without rework. Target: ≥ 98%. (5) Parts Availability: % work orders able to start on schedule due to parts availability. Target: ≥ 97%. (6) Inventory Turnover: COGS / average inventory. Target varies by part category — high-turn for consumables, lower for rotables. Dashboard: red/yellow/green traffic light for each KPI vs. target, trend sparkline for last 12 weeks, drill-down by work center." },
      { level: "Advanced", q: "You notice that after Boeing's 2020 workforce reduction, the JBS slippage metric increased significantly in 2021. Walk through a root cause analysis approach using data.", a: "Step 1 — Confirm the signal: plot JBS slippage % by month 2019-2022. Is the increase statistically significant (control chart, not just noise)? Step 2 — Segment the problem: break slippage by work center, job type, skill code. Is it everywhere or concentrated? Step 3 — Hypothesis: workforce reduction → loss of experienced mechanics → longer task times. Test with SQL: join work order slippage data to workforce data, correlate slippage rate with average_tenure_of_workforce and experience_ratio (senior/junior) by work center and month. Step 4 — Control for confounders: was there also a production rate change, new aircraft variant, tooling upgrades? Use multiple regression to isolate workforce effect. Step 5 — Quantify: for each 1% drop in average workforce tenure, what's the predicted increase in JBS slippage? Step 6 — Recommendation: targeted retention bonuses for senior mechanics in high-slippage work centers, accelerated mentoring programs." },
    ]
  },

  retail: {
    id: "retail",
    label: "Retail / Operations",
    icon: "🛒",
    color: "#34d399",
    description: "Supply chain analytics, fulfillment KPIs, inventory management, customer metrics",
    questions: [
      // Basic
      { level: "Basic", q: "What is on-time fulfillment rate and how would you calculate it from an orders table? Table: orders (order_id, order_date, promised_date, shipped_date).", a: "On-time fulfillment rate = orders shipped on or before promised date / total orders. SELECT COUNT(CASE WHEN shipped_date <= promised_date THEN 1 END) * 100.0 / COUNT(*) AS otf_rate FROM orders WHERE shipped_date IS NOT NULL. Filter to shipped_date IS NOT NULL to exclude open orders from the denominator. Track by store, region, and carrier to find where fulfillment is breaking down." },
      { level: "Basic", q: "What is inventory turnover and how do you calculate it? Why does a grocery pickup operation care about this metric?", a: "Inventory turnover = Cost of Goods Sold / Average Inventory Value. A grocery pickup operation cares intensely because perishables have a shelf life — low turnover means product is sitting too long and will spoil, causing both waste cost and stockout risk for customers. Target turnover varies by category: produce might turn weekly, dry goods monthly. SQL: SELECT category, SUM(cogs) / AVG(inventory_value) AS turnover FROM inventory_summary GROUP BY category." },
      { level: "Basic", q: "A store manager asks: which products had zero units sold in the last 30 days despite having inventory? Write the SQL.", a: "SELECT i.product_id, i.product_name, i.units_on_hand\nFROM inventory i\nLEFT JOIN sales s ON i.product_id = s.product_id\n  AND s.sale_date >= CURRENT_DATE - INTERVAL 30 DAY\nWHERE s.product_id IS NULL\n  AND i.units_on_hand > 0\nORDER BY i.units_on_hand DESC;\n\nThis is a classic LEFT JOIN + WHERE NULL pattern — finds products in inventory with no matching sales record in the 30-day window." },
      { level: "Basic", q: "What is a stockout and how would you flag products at risk of stocking out in a SQL query? Table: inventory (product_id, units_on_hand, avg_daily_demand).", a: "A stockout is when inventory hits zero and demand goes unmet — lost sales and a poor customer experience. Flag at-risk items: SELECT product_id, units_on_hand, avg_daily_demand, ROUND(units_on_hand / NULLIF(avg_daily_demand, 0), 1) AS days_of_supply FROM inventory WHERE units_on_hand / NULLIF(avg_daily_demand, 0) < 7 ORDER BY days_of_supply ASC. Items with less than 7 days of supply need replenishment action. NULLIF prevents divide-by-zero on items with zero demand." },
      { level: "Basic", q: "What does average order value (AOV) measure and how do you track it trending week over week in SQL?", a: "AOV = Total Revenue / Number of Orders. It measures how much customers spend per transaction. Week-over-week tracking: SELECT DATE_TRUNC('week', order_date) AS week, COUNT(DISTINCT order_id) AS orders, SUM(order_value) AS revenue, SUM(order_value) / COUNT(DISTINCT order_id) AS aov FROM orders GROUP BY week ORDER BY week. Use LAG() window function to add a WoW change column: LAG(aov) OVER (ORDER BY week) gives the prior week's AOV for comparison." },
      { level: "Basic", q: "Explain the difference between sell-through rate and inventory turnover. When would you use each?", a: "Sell-through rate = units sold / (units sold + units on hand) — measures what percentage of inventory was sold in a period. Inventory turnover = COGS / average inventory value — measures how many times inventory cycles through. Use sell-through for promotional analysis (did the sale clear inventory?) and seasonal planning (what % of summer items sold before fall?). Use turnover for financial efficiency and supply chain planning. Both together give a complete inventory health picture." },
      { level: "Basic", q: "What is a pivot table and give a real retail use case where you'd use one in Excel?", a: "A pivot table dynamically summarizes large datasets by grouping and aggregating without formulas. Retail use case: You have 500,000 rows of transaction data with columns: date, store_id, category, product, units, revenue. Create a pivot table with category in rows, month in columns, and SUM of revenue as values. Instantly see which categories grew or declined month-over-month across all stores. Add store_id as a slicer to filter to one region. What would take hours of SUMIF formulas takes 30 seconds with a pivot." },
      { level: "Basic", q: "What is a fill rate in supply chain analytics and how does it differ from on-time delivery?", a: "Fill rate = percentage of demand fulfilled from available stock (no backorders, no substitutions). Formula: units shipped / units ordered. On-time delivery = percentage of orders delivered by promised date. They measure different things: Fill rate is about completeness (did we have the product?). On-time delivery is about timing (did it arrive when promised?). You can have high fill rate but poor on-time (always ship complete but late). Or high on-time but low fill rate (arrive on time but only partial shipment)." },
      { level: "Basic", q: "You're analyzing grocery pickup wait times. Table: pickups (pickup_id, ordered_at, ready_at, picked_up_at). Write a query to find average wait time after the order is ready, by hour of day.", a: "SELECT HOUR(ready_at) AS hour_of_day,\n  AVG(TIMESTAMPDIFF(MINUTE, ready_at, picked_up_at)) AS avg_wait_minutes,\n  COUNT(*) AS pickup_count\nFROM pickups\nWHERE picked_up_at IS NOT NULL\n  AND picked_up_at >= ready_at\nGROUP BY HOUR(ready_at)\nORDER BY hour_of_day;\n\nThis reveals peak-hour congestion. The WHERE clause filters out data quality issues (pickup before ready time)." },
      { level: "Basic", q: "What is customer lifetime value (CLV) at a conceptual level and why do retail operations analysts care about it?", a: "CLV = predicted total revenue a customer will generate over their relationship with the company. Simple formula: CLV = Average Order Value × Purchase Frequency × Customer Lifespan. Operations analysts care because it drives prioritization decisions: if a high-CLV customer has a bad pickup experience, the cost is much higher than for a one-time shopper. It also informs how much to invest in fixing operational failures — a $50 compensation coupon makes sense for a customer worth $2,000 lifetime, not for one worth $50." },
      // Intermediate
      { level: "Intermediate", q: "Write a SQL query to identify the top 20% of customers by revenue (Pareto analysis) and what percentage of total revenue they represent.", a: "WITH customer_rev AS (\n  SELECT customer_id, SUM(order_value) AS total_rev\n  FROM orders GROUP BY customer_id\n),\nranked AS (\n  SELECT *, NTILE(5) OVER (ORDER BY total_rev DESC) AS quintile\n  FROM customer_rev\n)\nSELECT\n  SUM(CASE WHEN quintile = 1 THEN total_rev END) AS top_20pct_rev,\n  SUM(total_rev) AS all_rev,\n  ROUND(SUM(CASE WHEN quintile = 1 THEN total_rev END) / SUM(total_rev) * 100, 1) AS pct_of_total\nFROM ranked;\n\nNTILE(5) splits customers into 5 equal groups by revenue. Quintile 1 = top 20%. The classic Pareto finding: top 20% of customers typically drive 60-80% of revenue." },
      { level: "Intermediate", q: "Your grocery pickup store sees a spike in substitution rate on Tuesdays. How do you structure an analysis to find root cause?", a: "Substitution rate = orders with at least one substituted item / total orders. Structure: (1) Confirm the Tuesday pattern — group by day of week for last 12 weeks, verify it's consistent not random. (2) Which product categories have highest Tuesday substitution? — join to product categories, find if it's produce, dairy, or specific SKUs. (3) Is it a receiving day issue? — check if Tuesday is a slow receiving day (fewer trucks = depleted stock by picking time). (4) Is it pickers or inventory? — if the same items are substituted but in-stock per inventory system, it's a picker behavior issue. Present as hypothesis tree: confirmed pattern → category concentration → supply or process root cause." },
      { level: "Intermediate", q: "Design a Tableau dashboard for a grocery pickup operations manager. What KPIs and views would you include?", a: "Header KPIs (daily): On-Time Fulfillment Rate, Substitution Rate, Average Pick Time (minutes), Orders Completed, Substitution Rate vs. last week. Main views: (1) Hourly order volume vs. staffing capacity — bar/line combo chart. (2) Fulfillment rate by product category — sorted bar chart. (3) Pick time distribution — histogram to spot outliers. (4) Top 20 most-substituted items this week — table with units substituted and reason code. (5) Trend line: 13-week fulfillment rate with target reference line. Design principle: manager needs to know in 30 seconds if today is on track or needs intervention." },
      { level: "Intermediate", q: "What is cohort analysis in a retail context and how would you use Python pandas to build a customer retention cohort?", a: "Cohort analysis groups customers by when they first purchased and tracks their behavior over subsequent periods. In retail: do customers acquired in Q1 retain better than Q4 holiday shoppers?\n\nimport pandas as pd\ndf = pd.read_csv('orders.csv', parse_dates=['order_date'])\ndf['cohort'] = df.groupby('customer_id')['order_date'].transform('min').dt.to_period('M')\ndf['order_period'] = df['order_date'].dt.to_period('M')\ndf['period_number'] = (df['order_period'] - df['cohort']).apply(lambda x: x.n)\n\ncohort_data = df.groupby(['cohort','period_number'])['customer_id'].nunique().reset_index()\ncohort_pivot = cohort_data.pivot(index='cohort', columns='period_number', values='customer_id')\nretention = cohort_pivot.divide(cohort_pivot[0], axis=0) * 100\nprint(retention)" },
      { level: "Intermediate", q: "Explain the difference between ABC analysis and XYZ analysis in inventory management and how you'd combine them.", a: "ABC analysis classifies by value: A items = top 70-80% of revenue (typically 10-20% of SKUs), B = next 15-25%, C = bottom 5-10% of revenue but most SKUs. XYZ analysis classifies by demand variability: X = stable predictable demand (low variance), Y = moderate variability, Z = highly variable or sporadic demand. Combine them: AX items (high value, predictable) → tight inventory control, frequent replenishment. CZ items (low value, unpredictable) → keep buffer stock or consider dropping. AZ items (high value but unpredictable) → most dangerous — need safety stock and close monitoring. This matrix drives replenishment strategy per SKU class." },
      { level: "Intermediate", q: "Write a Python function that takes a DataFrame of daily sales and flags weeks where sales dropped more than 15% week-over-week for any product.", a: "import pandas as pd\n\ndef flag_sales_drops(df, threshold=0.15):\n    df = df.copy()\n    df['week'] = pd.to_datetime(df['date']).dt.to_period('W')\n    weekly = df.groupby(['product_id','week'])['units_sold'].sum().reset_index()\n    weekly = weekly.sort_values(['product_id','week'])\n    weekly['prev_week'] = weekly.groupby('product_id')['units_sold'].shift(1)\n    weekly['wow_change'] = (weekly['units_sold'] - weekly['prev_week']) / weekly['prev_week']\n    flagged = weekly[weekly['wow_change'] < -threshold].copy()\n    flagged['drop_pct'] = (flagged['wow_change'] * 100).round(1)\n    return flagged[['product_id','week','units_sold','prev_week','drop_pct']]\n\nresult = flag_sales_drops(sales_df)\nprint(f'{len(result)} product-weeks flagged')" },
      { level: "Intermediate", q: "What is a demand forecast and what are the differences between moving average, exponential smoothing, and seasonal decomposition methods?", a: "A demand forecast predicts future sales volume to drive inventory replenishment decisions. Moving average: simple average of last N periods — smooths noise but lags trends and ignores seasonality. Good for stable items. Exponential smoothing: weighted average giving more weight to recent data (alpha controls how fast weights decay) — better responsiveness than MA. Holt-Winters adds trend and seasonality components. Seasonal decomposition (STL): decomposes time series into trend + seasonal + residual components — best for items with strong weekly/monthly patterns like grocery. For a pickup grocery operation: most produce needs daily forecasting with weekly seasonality; staples can use weekly with monthly seasonality." },
      { level: "Intermediate", q: "How would you use Excel to build a dynamic dashboard for store-level fulfillment metrics that updates when new data is added?", a: "Structure: (1) Raw data in a named Excel Table (Ctrl+T) — tables auto-expand when new rows added. (2) Power Query to clean and aggregate the data — set to refresh automatically on open. (3) PivotTables sourced from the Query output — structured references update automatically. (4) Dashboard sheet with chart objects linked to PivotTable data. (5) Slicers connected to PivotTables for interactive filtering. Key: never build formulas that reference fixed cell ranges like A2:A1000 — always reference the Table name (Table1[Fulfillment_Rate]) so formulas survive new data additions. Add a 'Last Refreshed' cell with =NOW() formatted as timestamp." },
      // Advanced
      { level: "Advanced", q: "Design an end-to-end supply chain analytics pipeline for a grocery pickup operation that predicts stockout risk 48 hours in advance.", a: "Inputs: point-of-sale sales velocity (last 7 days per SKU), current inventory positions, scheduled deliveries (next 48h), historical demand patterns by day-of-week and season. Pipeline: (1) Ingest — Python pulls from inventory API + POS export daily. (2) Feature engineering — days of supply = on_hand / avg_daily_demand, demand_trend = slope of last 7 days, seasonal_index = ratio of this day's historical avg to overall avg. (3) Model — Gradient Boosting classifier, target = stockout_in_48h (binary). Features: days_of_supply, demand_trend, seasonal_index, scheduled_delivery_qty, day_of_week. (4) Output — risk score per SKU per store, pushed to dashboard with auto-generated replenishment recommendations. (5) Alert — Slack message to store manager for High risk items. Retrain model monthly as patterns shift." },
      { level: "Advanced", q: "Explain slowly changing dimensions using a retail example, and implement a Type 2 SCD update in SQL.", a: "SCD Type 2 preserves history when a dimension attribute changes. Retail example: a customer moves from Chicago to Dallas. You need historical orders to show Chicago, future orders to show Dallas. Implementation:\n\n-- Insert new record, close old one\nUPDATE dim_customer\nSET end_date = CURRENT_DATE - 1, is_current = FALSE\nWHERE customer_id = 12345 AND is_current = TRUE;\n\nINSERT INTO dim_customer\n  (customer_id, city, state, start_date, end_date, is_current)\nVALUES\n  (12345, 'Dallas', 'TX', CURRENT_DATE, '9999-12-31', TRUE);\n\nWhen joining orders to customers: JOIN dim_customer ON order.customer_id = dim_customer.customer_id AND order.order_date BETWEEN dim_customer.start_date AND dim_customer.end_date. This gives historically accurate city for every order." },
      { level: "Advanced", q: "A regional VP wants to know which stores are underperforming relative to their market potential. How do you build a store performance index?", a: "Market potential approach: (1) Define potential — use external data (population density, median income, competitor proximity) to estimate a market index per store location. (2) Calculate actual performance — revenue per square foot, transactions per day, basket size. (3) Build index — standardize both actual and potential to z-scores, calculate performance_index = actual_zscore / potential_zscore. Stores > 1.0 are outperforming their market; < 0.5 are significantly underperforming. (4) Segment — high potential + low performance = priority investment targets. Low potential + low performance = consider closure. High performance everywhere = identify what those stores do differently and replicate. Present as scatter plot: x-axis = market potential, y-axis = actual performance, quadrant lines at median." },
      { level: "Advanced", q: "Walk through how you would implement a recommendation system for a grocery pickup platform to suggest substitutions when items are out of stock.", a: "Approach: content-based + collaborative filtering hybrid. (1) Content features per product: category, brand, nutritional profile, price tier, packaging size. (2) Customer purchase history — which substitutions did customers accept vs. reject previously? Accepted = positive signal. (3) Collaborative filtering — customers who bought item A also bought item B (market basket analysis using Apriori or FP-Growth algorithm in Python mlxtend). (4) Ranking — score each candidate substitution by: similarity score × customer acceptance history × price delta penalty × availability. (5) Business rules override — never substitute organic with non-organic unless customer explicitly allows it. (6) Deploy — API endpoint: given item_id + customer_id, return ranked list of 3 substitution candidates with confidence scores." },
      { level: "Advanced", q: "How would you build a Python ETL pipeline to consolidate sales data from 200 stores into a central analytics database, handling schema differences, missing data, and incremental loads?", a: "import pandas as pd\nfrom sqlalchemy import create_engine\nimport os\nfrom datetime import datetime, timedelta\n\ndef extract(store_id, last_run_date):\n    # Pull only new data since last run (incremental)\n    df = pd.read_csv(f'stores/{store_id}/sales.csv', parse_dates=['date'])\n    return df[df['date'] > last_run_date]\n\ndef transform(df, store_id):\n    # Standardize schema differences across stores\n    col_map = {'Sale_Amt': 'revenue', 'Units': 'units_sold', 'Prod_ID': 'product_id'}\n    df = df.rename(columns={k:v for k,v in col_map.items() if k in df.columns})\n    df['store_id'] = store_id\n    df = df.dropna(subset=['product_id','revenue'])  # drop critical nulls\n    df['revenue'] = pd.to_numeric(df['revenue'], errors='coerce').fillna(0)\n    return df[['date','store_id','product_id','units_sold','revenue']]\n\ndef load(df, engine):\n    df.to_sql('sales_fact', engine, if_exists='append', index=False,\n              method='multi', chunksize=1000)  # batch inserts for performance\n\nengine = create_engine('postgresql://...')\nlast_run = datetime.today() - timedelta(days=1)\nfor store_id in range(1, 201):\n    try:\n        df = extract(store_id, last_run)\n        df = transform(df, store_id)\n        load(df, engine)\n    except Exception as e:\n        print(f'Store {store_id} failed: {e}')  # log, don't crash pipeline" },
      { level: "Basic", q: "What is a same-store sales (comp sales) metric and how do you calculate it? Why do retailers use it instead of total revenue growth?", a: "Same-store sales measures revenue growth for stores open for at least 12 months, excluding new store openings. Formula: (current_period_revenue_for_comp_stores - prior_period_revenue_for_comp_stores) / prior_period_revenue × 100. SQL: SELECT SUM(CASE WHEN is_comp_store = 1 THEN current_revenue END) / SUM(CASE WHEN is_comp_store = 1 THEN prior_revenue END) - 1 AS comp_sales_growth FROM stores. Retailers use it because total revenue growth can be inflated by new store openings — comp sales shows whether the existing business is actually growing. It's the most closely watched metric in retail earnings." },
      { level: "Basic", q: "What is shrinkage in retail analytics and how would you quantify it?", a: "Shrinkage = the difference between recorded inventory and actual physical inventory. Sources: theft (external and internal), vendor fraud, administrative errors, and damage. Formula: shrinkage_rate = (book_inventory - physical_count) / book_inventory × 100. SQL: SELECT category, SUM(book_qty * unit_cost) AS book_value, SUM(physical_qty * unit_cost) AS physical_value, (SUM(book_qty) - SUM(physical_qty)) * AVG(unit_cost) AS shrink_dollars, (SUM(book_qty) - SUM(physical_qty)) / SUM(book_qty) * 100 AS shrink_rate FROM inventory_audit GROUP BY category ORDER BY shrink_dollars DESC. Benchmark: grocery retail typically targets < 1% shrinkage." },
      { level: "Intermediate", q: "How would you use Python to detect anomalies in daily store sales that might indicate data quality issues or operational problems?", a: "import pandas as pd\nimport numpy as np\n\ndef detect_sales_anomalies(df):\n    df = df.sort_values(['store_id', 'date'])\n    # Calculate rolling stats per store\n    df['rolling_mean'] = df.groupby('store_id')['daily_sales'].transform(\n        lambda x: x.rolling(14, min_periods=7).mean()\n    )\n    df['rolling_std'] = df.groupby('store_id')['daily_sales'].transform(\n        lambda x: x.rolling(14, min_periods=7).std()\n    )\n    # Flag if more than 3 std devs from rolling mean\n    df['z_score'] = (df['daily_sales'] - df['rolling_mean']) / df['rolling_std']\n    df['anomaly_flag'] = df['z_score'].abs() > 3\n    df['anomaly_type'] = np.where(df['z_score'] > 3, 'spike', \n                          np.where(df['z_score'] < -3, 'drop', 'normal'))\n    return df[df['anomaly_flag']][['store_id','date','daily_sales','z_score','anomaly_type']]\n\n# Zero sales on a non-holiday = likely POS system down, not a true zero\nalerts = detect_sales_anomalies(sales_df)\nprint(f'{len(alerts)} anomalies detected — review with store ops team')" },
      { level: "Intermediate", q: "What is basket size analysis and how would you segment customers by basket behavior in SQL?", a: "Basket size = average transaction value per customer visit. Segment customers: SELECT customer_id, AVG(transaction_total) AS avg_basket, COUNT(transaction_id) AS visit_frequency, SUM(transaction_total) AS total_spend, NTILE(4) OVER (ORDER BY AVG(transaction_total)) AS basket_quartile, NTILE(4) OVER (ORDER BY COUNT(transaction_id)) AS frequency_quartile FROM transactions GROUP BY customer_id. Then classify: high basket + high frequency = Champions. High basket + low frequency = Big Spenders (infrequent). Low basket + high frequency = Deal Seekers. Low basket + low frequency = At Risk. Each segment gets a different retention and upsell strategy. Walmart grocery pickup customers skew toward large weekly baskets — basket size is a key health metric." },
      { level: "Advanced", q: "How would you measure the cannibalization effect when Walmart launches a new store near an existing one? Walk through the analytics approach.", a: "Define the problem: does the new store take sales from the existing store, and by how much? Approach: (1) Control group — identify comparable stores in markets without new store openings, matched on store size, demographics, comp sales trend. (2) Difference-in-differences analysis: measure existing store sales trend before new store opens, compare to control group trend. Post-opening divergence = cannibalization estimate. (3) SQL: create pre/post flags, calculate: avg_sales(existing store, post) - avg_sales(existing store, pre) - [avg_sales(control, post) - avg_sales(control, pre)]. The bracketed term removes macro trends. (4) Geographic analysis: what % of new store's customers have existing store loyalty cards? If 40% of new store customers previously shopped the old store → high cannibalization. (5) Timeline: cannibalization typically peaks in months 3-9, then subsides as market expands. Present as: total market sales growth vs. individual store comp sales impact." },
      { level: "Basic", q: "What is net promoter score (NPS) and how would you track it in a grocery pickup context?", a: "NPS = % Promoters (9-10 rating) - % Detractors (0-6 rating). Passives (7-8) are excluded. Survey question: 'How likely are you to recommend Walmart Pickup to a friend?' Scale 0-10. In grocery pickup, NPS is tracked after each order completion. SQL: SELECT (SUM(CASE WHEN score >= 9 THEN 1 END) - SUM(CASE WHEN score <= 6 THEN 1 END)) * 100.0 / COUNT(*) AS nps FROM pickup_surveys WHERE survey_date >= CURRENT_DATE - 30. Track NPS by store, associate, pickup time slot, and weather conditions. Low NPS on Friday evenings often indicates staffing/wait time issues. Benchmark: NPS > 50 is excellent for grocery." },
      { level: "Intermediate", q: "How would you build an A/B test to measure whether a new grocery pickup UI reduces order abandonment? What metrics do you track and how do you analyze results?", a: "Setup: randomly assign customers to control (old UI) vs. treatment (new UI) — randomize at customer_id level, not session level, to avoid same customer seeing both versions. Primary metric: order completion rate = completed_orders / started_orders. Secondary: time-to-complete, items per order, customer satisfaction score. Run for: minimum 2 weeks (capture weekly patterns), targeting 80% statistical power with 5% significance level — use a sample size calculator to determine required n per arm. Analysis SQL: SELECT test_group, COUNT(DISTINCT session_id) AS sessions, SUM(completed) AS completions, AVG(completed) AS completion_rate FROM ab_test_assignments t JOIN sessions s ON t.customer_id = s.customer_id GROUP BY test_group. Statistical test: two-proportion z-test or chi-square. Watch for: novelty effect (new UI looks better initially), seasonal confounding, and segment differences (mobile vs. desktop may respond differently)." },
    ]
  },

  healthcare: {
    id: "healthcare",
    label: "Healthcare / MSPB",
    icon: "🏥",
    color: "#f472b6",
    description: "CMS analytics, MSPB spending, readmission rates, quality measures, value-based care",
    questions: [
      // Basic
      { level: "Basic", q: "What is the Medicare Spending Per Beneficiary (MSPB) measure and what does it capture?", a: "MSPB measures Medicare spending for services during an episode of care: 3 days before inpatient admission through 30 days after discharge. It captures the full cost of care, not just the hospital stay. CMS uses it to compare hospitals' efficiency relative to the national median. An MSPB ratio > 1.0 means a hospital spends more than the national median after adjusting for patient complexity. It's used in the Hospital Value-Based Purchasing program to reward efficient high-quality care." },
      { level: "Basic", q: "What is a 30-day readmission rate and how would you calculate it from claims data?", a: "30-day readmission rate = patients readmitted to any hospital within 30 days of discharge / total discharges for that condition. CMS calculates risk-standardized readmission rates (RSRR) that adjust for patient complexity. Basic SQL: SELECT COUNT(CASE WHEN EXISTS (SELECT 1 FROM admissions r WHERE r.patient_id = a.patient_id AND r.admit_date BETWEEN a.discharge_date AND a.discharge_date + 30 AND r.admission_id != a.admission_id) THEN 1 END) * 100.0 / COUNT(*) AS readmission_rate FROM admissions a WHERE a.discharge_date IS NOT NULL." },
      { level: "Basic", q: "What is risk adjustment in healthcare analytics and why is it necessary when comparing hospitals?", a: "Risk adjustment accounts for differences in patient complexity across hospitals — you can't fairly compare a trauma center serving critically ill patients to a community hospital serving healthier patients. CMS uses hierarchical condition categories (HCCs) based on diagnoses to create a risk score per patient. An adjusted measure controls for patient mix, so differences in outcomes or spending reflect care quality and efficiency, not just who gets sicker patients. Without risk adjustment, hospitals serving complex patients would always look worse." },
      { level: "Basic", q: "What is a DRG (Diagnosis Related Group) and why do analysts use it to segment hospital data?", a: "A DRG is a classification system that groups patients with similar diagnoses, treatments, and expected resource consumption into categories used for Medicare payment. Hospitals receive a fixed payment per DRG regardless of actual cost — incentive to be efficient. Analysts use DRGs to: compare costs for similar conditions across hospitals (apples-to-apples), identify high-cost DRGs driving MSPB, analyze length of stay variation within the same DRG, and identify outlier cases. DRG 470 (Major Hip and Knee Replacement) is one of the most common and closely watched." },
      { level: "Basic", q: "Write a SQL query to calculate average length of stay by diagnosis category from an admissions table.", a: "SELECT diagnosis_category,\n  COUNT(*) AS total_admissions,\n  AVG(DATEDIFF(discharge_date, admit_date)) AS avg_los_days,\n  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY DATEDIFF(discharge_date, admit_date)) AS median_los\nFROM admissions\nWHERE discharge_date IS NOT NULL\nGROUP BY diagnosis_category\nORDER BY avg_los_days DESC;\n\nMedian is often more useful than mean for LOS because outliers (very long stays) can skew the average significantly." },
      { level: "Basic", q: "What is the difference between a process measure and an outcome measure in healthcare quality analytics?", a: "Process measures track whether providers did the right thing — e.g., did the patient receive aspirin within 24 hours of heart attack? Outcome measures track what happened to the patient — mortality rate, readmission rate, complication rate. Process measures are easier to control but don't guarantee good outcomes. Outcome measures are what ultimately matters but are influenced by factors outside provider control (patient behavior, social determinants). MSPB is an outcome measure (spending outcome). Appropriate VTE prophylaxis given is a process measure. Good analytics uses both to get the full picture." },
      { level: "Basic", q: "What is a claim in healthcare data and what key fields does a medical claim contain?", a: "A claim is a bill submitted to an insurer (Medicare, Medicaid, commercial) for services rendered. Key fields: claim_id, patient_id (beneficiary), provider_NPI, admission_date, discharge_date, principal_diagnosis (ICD-10 code), secondary diagnoses (up to 25 in Medicare), procedure codes (CPT), DRG_code, total_charges, allowed_amount, paid_amount, claim_type (inpatient/outpatient/physician). The paid_amount is what the insurer actually reimbursed after applying coverage rules. Analysts join claim types to build episode-level spending — the foundation of MSPB analysis." },
      { level: "Basic", q: "What is an ICD-10 code and how is it used in healthcare analytics?", a: "ICD-10 (International Classification of Diseases, 10th revision) is the standard system for coding diagnoses and procedures. Format: letter + 2 numbers + optional decimal + up to 4 characters (e.g., J18.9 = Pneumonia, unspecified). In analytics, ICD-10 codes are used to: identify patient conditions (filter to pneumonia patients), group into DRGs, calculate comorbidity scores (Elixhauser, Charlson), identify complications, and define cohorts for readmission analysis. Clinical knowledge matters — ICD codes have hierarchies; J18.x = all pneumonia codes, not just J18.9." },
      { level: "Basic", q: "A hospital administrator asks you to compare their MSPB to similar hospitals. How do you define 'similar' for a fair comparison?", a: "Define peer group using: (1) Hospital size — similar number of beds or annual discharges. (2) Teaching status — academic medical centers vs. community hospitals (different case mix). (3) Urban vs. rural — affects patient complexity and access to post-acute care. (4) Geographic region — wage index affects labor costs. (5) Safety-net status — hospitals serving high proportions of dual-eligible (Medicare+Medicaid) patients have different patient complexity. CMS already risk-adjusts MSPB for patient complexity, but peer benchmarking within similar hospital types gives more actionable comparisons than raw national comparisons." },
      { level: "Basic", q: "What is the Charlson Comorbidity Index and how is it used in healthcare data analysis?", a: "The Charlson Comorbidity Index (CCI) assigns weights to 17 conditions (diabetes, heart failure, cancer, etc.) based on their impact on 1-year mortality risk. A patient's CCI score is the sum of weights for all conditions present. Higher score = more complex/sicker patient. In analytics it's used for: risk adjustment (control for comorbidity differences between hospitals), patient stratification (separate analyses by complexity tier), cost prediction (CCI correlates strongly with MSPB), and identifying high-risk patients for care management programs. Calculated by mapping ICD-10 codes to CCI categories." },
      // Intermediate
      { level: "Intermediate", q: "Write a Python script to calculate the risk-standardized readmission rate for a hospital using logistic regression, adjusting for patient age, gender, and Charlson comorbidity score.", a: "import pandas as pd\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.preprocessing import StandardScaler\n\n# df: patient-level data with readmission outcome\nfeatures = ['age', 'gender_male', 'charlson_score', 'los_index_admit']\nX = df[features]\ny = df['readmitted_30d']\n\n# Fit model on full dataset (or national reference)\nscaler = StandardScaler()\nX_scaled = scaler.fit_transform(X)\nmodel = LogisticRegression()\nmodel.fit(X_scaled, y)\n\n# Risk-standardized rate = observed / expected * national rate\ndf['predicted_prob'] = model.predict_proba(X_scaled)[:, 1]\nhospital = df[df['hospital_id'] == target_hospital_id]\nobserved = hospital['readmitted_30d'].mean()\nexpected = hospital['predicted_prob'].mean()\nnational_rate = df['readmitted_30d'].mean()\nrsrr = (observed / expected) * national_rate\nprint(f'RSRR: {rsrr:.4f}')" },
      { level: "Intermediate", q: "How would you build a Tableau dashboard to help a hospital quality team monitor their MSPB performance across service lines?", a: "Views: (1) MSPB ratio trend — line chart by month, reference line at 1.0 (national median), color-coded above/below. (2) MSPB breakdown by episode phase — stacked bar showing index admission, post-acute, physician/other spending components. (3) Service line comparison — sorted bar chart of MSPB ratio by DRG or service line (cardiology, orthopedics, etc.). (4) Outlier cases — scatter plot of individual episode cost vs. risk score, flag statistical outliers. (5) Readmission driver analysis — which conditions are most associated with readmissions and high post-acute costs? Use parameter to switch between MSPB ratio, raw spending, and percentile rank vs. peers. Color-code all views: green < 0.9, yellow 0.9-1.1, red > 1.1." },
      { level: "Intermediate", q: "What is a funnel plot in healthcare analytics and when would you use it?", a: "A funnel plot displays hospital-level performance metrics (e.g., readmission rates, MSPB) on the y-axis against hospital volume (discharges) on the x-axis. Control limits form a funnel shape — wider at low volume (high statistical uncertainty), narrowing at high volume. Hospitals outside the funnel are statistical outliers — genuinely different performance, not just random variation. Use it when: comparing many hospitals on an outcome metric, you want to identify which outliers are statistically significant (not just noisy low-volume hospitals), and you want to communicate uncertainty visually. Much better than a simple ranked bar chart because it accounts for sample size." },
      { level: "Intermediate", q: "Describe how you would use SQL window functions to identify patients who had multiple admissions within a 90-day period (potential high utilizers for care management).", a: "SELECT patient_id, admit_date, discharge_date,\n  COUNT(*) OVER (\n    PARTITION BY patient_id\n    ORDER BY admit_date\n    RANGE BETWEEN INTERVAL 90 DAY PRECEDING AND CURRENT ROW\n  ) AS admissions_in_90day_window\nFROM admissions\nHAVING admissions_in_90day_window >= 3\nORDER BY patient_id, admit_date;\n\nThis uses a sliding window range frame. RANGE BETWEEN INTERVAL 90 DAY PRECEDING AND CURRENT ROW counts all admissions for that patient in the 90 days before and including the current row's date — identifies frequent fliers regardless of which specific 90-day window you look at." },
      { level: "Intermediate", q: "What is the difference between Medicare FFS (fee-for-service) data and Medicare Advantage data in healthcare analytics, and how does this affect MSPB analysis?", a: "Medicare FFS: government pays providers directly per service — complete, detailed claims data available for analysis. Medicare Advantage: private insurers receive capitated payments from CMS, then pay providers — encounter data is less complete and standardized than FFS claims. MSPB is calculated only on FFS beneficiaries because complete episode-level claims are available. This creates a selection bias problem: if sicker patients disproportionately stay in FFS while healthier patients enroll in MA, MSPB comparisons across time or geographies can be distorted by this enrollment shift. Analysts must always note what proportion of patients are FFS vs. MA in their market." },
      { level: "Intermediate", q: "Write a Python script to calculate Elixhauser comorbidity scores from a DataFrame of ICD-10 diagnosis codes.", a: "ELIXHAUSER_MAP = {\n  'CHF': ['I099','I110','I130','I132','I255','I420','I425','I426','I427','I428','I429','I43','I50'],\n  'Diabetes': ['E100','E101','E109','E110','E111','E119','E120','E121','E129'],\n  # ... (full map has 30+ conditions)\n}\n\ndef calc_elixhauser(icd_list):\n    score = 0\n    conditions_present = []\n    for condition, codes in ELIXHAUSER_MAP.items():\n        if any(code[:3] in [c[:3] for c in codes] for code in icd_list):\n            score += 1\n            conditions_present.append(condition)\n    return score, conditions_present\n\n# Apply to patient-level DataFrame\ndf['icd_list'] = df['diagnosis_codes'].str.split(',')\ndf[['elixhauser_score','conditions']] = pd.DataFrame(\n    df['icd_list'].apply(calc_elixhauser).tolist(), index=df.index\n)" },
      { level: "Intermediate", q: "How would you design a cohort study in SQL to compare 30-day readmission rates between patients who received discharge planning versus those who did not?", a: "WITH discharge_planning AS (\n  -- Flag patients who received discharge planning service\n  SELECT DISTINCT patient_id, 1 AS had_planning\n  FROM procedures\n  WHERE procedure_code IN ('99495','99496')  -- Transitional Care Management codes\n),\ncohort AS (\n  SELECT a.patient_id, a.discharge_date,\n    COALESCE(dp.had_planning, 0) AS had_planning\n  FROM admissions a\n  LEFT JOIN discharge_planning dp ON a.patient_id = dp.patient_id\n),\nreadmits AS (\n  SELECT DISTINCT a.patient_id\n  FROM admissions a\n  JOIN cohort c ON a.patient_id = c.patient_id\n  WHERE a.admit_date BETWEEN c.discharge_date AND c.discharge_date + 30\n)\nSELECT had_planning,\n  COUNT(*) AS n,\n  SUM(CASE WHEN r.patient_id IS NOT NULL THEN 1 ELSE 0 END) AS readmissions,\n  ROUND(AVG(CASE WHEN r.patient_id IS NOT NULL THEN 1.0 ELSE 0 END) * 100, 2) AS readmit_rate\nFROM cohort c LEFT JOIN readmits r ON c.patient_id = r.patient_id\nGROUP BY had_planning;" },
      { level: "Intermediate", q: "What is post-acute care spending and why does it matter so much in MSPB analysis?", a: "Post-acute care (PAC) includes skilled nursing facility (SNF) stays, home health visits, inpatient rehabilitation, and long-term acute care after a hospital discharge. PAC often represents 30-50% of total MSPB spending — sometimes more than the hospital stay itself. It matters because: (1) Hospitals have limited control over it (patients choose their SNF) but it's in their MSPB calculation. (2) There's enormous variation in PAC utilization rates and costs across hospitals and regions. (3) High-performing hospitals on MSPB typically have active discharge planning programs that steer patients to high-quality, cost-effective PAC providers. (4) The 30-day window post-discharge is where readmissions add the most cost." },
      // Advanced
      { level: "Advanced", q: "Design a full analytics framework to identify the 5 biggest drivers of MSPB above the national median for a hospital system with 8 facilities.", a: "Framework: (1) Decomposition — break MSPB into components: index admission, readmissions, SNF stays, home health, physician services. Which component is highest vs. peers? (2) DRG-level analysis — for each component, which DRGs contribute most to above-median spending? Focus on high-volume, high-variance DRGs. (3) Process analysis — for top DRGs: compare LOS, discharge destination mix (home vs. SNF vs. rehab), readmission rates. Where is the variation coming from? (4) Provider-level analysis — within DRGs, is variation driven by specific physicians, hospitalists, or discharge planners? (5) Root cause — for each driver, is it patient acuity (case mix issue), process (discharge planning), or network (using expensive PAC providers)? Output: heat map of 8 facilities × 5 spending drivers, plus waterfall chart showing path from facility MSPB to national median." },
      { level: "Advanced", q: "Walk through how you would build a propensity score matching analysis in Python to evaluate the impact of a care transitions program on 30-day readmissions.", a: "from sklearn.linear_model import LogisticRegression\nfrom sklearn.preprocessing import StandardScaler\nimport pandas as pd\nimport numpy as np\n\n# Covariates to balance on\ncovariates = ['age','gender','charlson_score','prior_admits_12mo','drg_weight','discharge_disposition']\n\n# Step 1: Estimate propensity scores\nX = df[covariates]\ny = df['received_intervention']  # 1 = care transitions program\nscaler = StandardScaler()\nmodel = LogisticRegression(max_iter=1000)\nmodel.fit(scaler.fit_transform(X), y)\ndf['propensity_score'] = model.predict_proba(scaler.transform(X))[:,1]\n\n# Step 2: Match treated to control (nearest neighbor, caliper = 0.02)\ntreated = df[df['received_intervention']==1].copy()\ncontrol = df[df['received_intervention']==0].copy()\n\nmatches = []\nfor _, t_row in treated.iterrows():\n    diffs = abs(control['propensity_score'] - t_row['propensity_score'])\n    best = diffs.idxmin()\n    if diffs[best] < 0.02:  # caliper\n        matches.append((t_row.name, best))\n        control = control.drop(best)  # remove matched control\n\n# Step 3: Compare outcomes in matched sample\nmatched_ids = [i for pair in matches for i in pair]\nmatched_df = df.loc[matched_ids]\noutcome = matched_df.groupby('received_intervention')['readmitted_30d'].mean()\nprint(f'Treated: {outcome[1]:.3f}, Control: {outcome[0]:.3f}, Difference: {outcome[1]-outcome[0]:.3f}')" },
      { level: "Advanced", q: "What are the major methodological limitations of using Medicare claims data for outcomes research, and how do you address them?", a: "Limitations and mitigations: (1) Selection bias — sicker patients may systematically go to certain hospitals. Mitigate: risk adjustment using patient characteristics; consider instrumental variables. (2) Coding variation — some hospitals code more diagnoses (capturing more comorbidities) which can make them appear sicker and affect risk adjustment. Mitigate: use only present-on-admission flags for comorbidities. (3) FFS only — MA patients excluded (35%+ of Medicare now). Mitigate: note this limitation, use supplemental MA encounter data if available. (4) Lag — claims data typically 3-6 months delayed. Mitigate: use for retrospective analysis, not real-time monitoring. (5) Incomplete care picture — claims show what was billed, not clinical detail. Mitigate: supplement with EHR data for process measures. (6) Spillover effects — a hospital intervention may affect non-Medicare patients too, but you only see Medicare outcomes." },
      { level: "Advanced", q: "How would you build a predictive model to identify patients at high risk of 30-day readmission at discharge, using claims and EHR data?", a: "Feature engineering from claims: prior_admits_12mo, charlson_score, MSPB_index_admission, discharge_disposition, los, drg_weight, payer_mix, post_acute_referral_made. From EHR: vital sign instability at discharge, polypharmacy_count, social_determinants (housing_unstable, low_health_literacy, lives_alone), discharge_teaching_completed. Model: XGBoost classifier — handles missing data, non-linear interactions, outputs calibrated probabilities. Target: readmission within 30 days. Evaluation: AUROC > 0.75 is good, also check calibration curve (predicted probabilities match observed rates). At discharge: score each patient, flag top 20% as high-risk, trigger care transitions referral. Monitor: track model performance monthly, check for calibration drift as patient mix shifts. Retrain quarterly." },
      { level: "Advanced", q: "Explain how value-based purchasing programs like HVBP create financial incentives related to MSPB, and how a data analyst supports the hospital's strategy.", a: "Hospital Value-Based Purchasing (HVBP) adjusts Medicare payments by up to ±2% based on performance across four domains: Clinical Outcomes (25%), Person & Community Engagement (25%), Safety (25%), and Efficiency & Cost Reduction (25%). MSPB falls in the Efficiency domain. How it works: CMS scores each hospital 0-10 on MSPB relative to national performance. Higher score = higher payment adjustment bonus. A hospital with MSPB ratio above 1.1 could lose 1-2% of all Medicare DRG payments — millions of dollars. Analyst's role: (1) Monthly MSPB tracking against prior year and national benchmarks. (2) Simulation modeling — if we reduce SNF utilization by X%, what's the projected MSPB impact? (3) Service line reports — which DRGs are dragging MSPB up? (4) Physician scorecards — show each admitting physician their episode costs vs. peers. (5) ROI analysis — is investing in discharge planning staff worth the MSPB improvement?" },
      { level: "Basic", q: "What is a Diagnosis Related Group (DRG) and why is it the fundamental unit of analysis in hospital financial analytics?", a: "A DRG is a classification system that groups hospital inpatient stays by diagnosis, procedure, complications, and patient age into clinically coherent, financially similar groups. Medicare pays a fixed amount per DRG regardless of actual costs — this is prospective payment. Each DRG has a relative weight (e.g. a complex cardiac DRG might have weight 3.5, meaning it pays 3.5x the base rate). DRG is the fundamental unit because: (1) It's how Medicare pays — every financial analysis starts with DRG. (2) Comparing hospitals fairly requires DRG adjustment for case mix. (3) Volume + DRG weight = case mix index, the primary driver of revenue." },
      { level: "Basic", q: "What is length of stay (LOS) and why does it matter in MSPB analysis?", a: "Length of stay = number of days from admission to discharge. LOS matters in MSPB because: (1) Longer LOS = higher direct hospital costs for that admission. (2) Hospitals with above-average LOS for a DRG often have higher MSPB ratios. (3) However, appropriate LOS vs. excessive LOS requires clinical context — discharging patients too quickly increases readmission risk, which also increases MSPB. The sweet spot: LOS at or near the geometric mean for each DRG while minimizing 30-day readmissions. SQL: SELECT drg_code, AVG(los) AS avg_los, national_gmlos, AVG(los) - national_gmlos AS los_variance FROM admissions GROUP BY drg_code ORDER BY los_variance DESC." },
      { level: "Intermediate", q: "What is case mix index (CMI) and how do you calculate and interpret it?", a: "Case Mix Index = average DRG relative weight for all admissions. Formula: CMI = SUM(drg_weight for all discharges) / total_discharge_count. A higher CMI means the hospital treats more complex, resource-intensive patients. Interpreting CMI changes: if CMI increases and revenue increases proportionally, the hospital is correctly capturing complexity. If CMI is flat but MSPB is rising, inefficiency (not complexity) is driving costs. SQL: SELECT period, SUM(d.relative_weight) / COUNT(a.admission_id) AS cmi FROM admissions a JOIN drg_weights d ON a.drg_code = d.drg_code GROUP BY period. CMI of 1.5 means your average patient is 50% more complex than the national base case." },
      { level: "Intermediate", q: "How would you build a Tableau dashboard to help a hospital's CFO monitor MSPB performance monthly? Describe the key views.", a: "Dashboard layout: (1) Header scorecard — current MSPB ratio vs. last year vs. national median. Red/yellow/green status. (2) Trend line — 24-month MSPB ratio with benchmark overlay. Forecast line using linear trend. (3) Component waterfall — MSPB breakdown: index admission + readmissions + SNF + home health + physician services. Which component drives variance vs. peers? (4) DRG heat map — top 20 DRGs by volume, color-coded by MSPB ratio vs. national. Click to drill in. (5) Discharge destination donut — % going home vs. SNF vs. rehab vs. other. High SNF % = major MSPB driver. (6) Physician scorecard — avg episode cost by attending physician for top DRGs. Anonymized for public view, identified for internal. Filters: date range, DRG, service line, facility." },
      { level: "Intermediate", q: "What is risk adjustment in healthcare analytics and why is it essential when comparing hospital outcomes?", a: "Risk adjustment statistically controls for differences in patient complexity so that hospital outcomes reflect care quality, not just how sick the patients were. Without it: a safety-net hospital serving elderly, diabetic, low-income patients will always look worse than a community hospital serving healthy, young patients even if care quality is identical. Methods: (1) CMS Hierarchical Condition Categories (HCC) — assigns weights to diagnoses to predict cost. (2) Elixhauser comorbidity index — counts 30+ comorbidities and weights their effect on outcomes. (3) Direct standardization — apply hospital's actual case mix to a reference population's rates. When doing MSPB analysis: always compare your hospital's risk-adjusted ratio to the national median, never raw spending. A hospital treating sicker patients should have higher raw spending but a similar or lower risk-adjusted ratio." },
      { level: "Advanced", q: "You are asked to identify the top 5 opportunities to reduce MSPB at a 500-bed academic medical center. Walk through your analysis framework.", a: "Framework: (1) Decompose MSPB by component: what % is index admission, readmissions, SNF, home health, physician? Identify which component is highest vs. national benchmark. (2) Volume-weighted impact: rank DRGs by (volume × MSPB ratio vs. national). High volume + high ratio = biggest opportunity. Focus on top 10 DRGs which typically represent 60%+ of total MSPB. (3) Process drill-down per top DRG: compare LOS, discharge destination mix (home vs. SNF vs. rehab), readmission rate, physician practice variation. (4) Root cause: for each DRG — is the driver LOS? Post-acute overutilization? Specific physician outliers? Readmissions? (5) Quantify opportunity: if DRG X MSPB ratio went from 1.15 to 1.05 (national), what is the annual episode cost reduction? Multiply by volume. Sum top 5 opportunities = total addressable savings. Prioritize by: impact × feasibility × timeline to results. Present as heat map + waterfall chart." },
    ]
  }
};

const DOMAIN_MODULE_IDS = Object.keys(DOMAIN_PACKS);

// ── PERSISTENCE ───────────────────────────────────────────────────────────────

const STORAGE_KEY = "analyst-sharpener-v1";

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

function saveProgress(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

function defaultProgress() {
  return {
    streak: 0,
    lastSessionDate: null,
    totalSessions: 0,
    allTimeScores: {},       // key: "module:idx" → latest score string
    scoreCounts: {},         // key: "module:idx" → { strong, partial, weak }
    lastSeen: {},            // key: "module:idx" → ISO date string
    weakQueue: [],
    dailyGoalDone: false,
    lastSessionSummary: null,
  };
}

// ── SPACED REPETITION HELPERS ─────────────────────────────────────────────────

function getSpacedRepPriority(progress, key) {
  const counts = progress.scoreCounts?.[key] || { strong: 0, partial: 0, weak: 0 };
  const lastSeenDate = progress.lastSeen?.[key];
  const daysSince = lastSeenDate
    ? Math.floor((Date.now() - new Date(lastSeenDate)) / 86400000)
    : 999;
  // Weak unseen: highest
  if (counts.weak > 0 && counts.strong === 0) return 100 + daysSince;
  // Partial not yet mastered
  if (counts.partial > 0 && counts.strong < 2) return 70 + daysSince;
  // Strong 1-2x: surface after a few days
  if (counts.strong >= 1 && counts.strong < 3) return Math.max(0, 40 - counts.strong * 10 + daysSince * 2);
  // Strong 3+: surface weekly
  if (counts.strong >= 3) return Math.max(0, 10 + daysSince - counts.strong * 5);
  // Unseen
  return 80 + daysSince;
}

function sortCardsBySpacedRep(cards, module, progress) {
  return [...cards]
    .map((card, i) => ({ card, origIdx: i, priority: getSpacedRepPriority(progress, `${module}:${i}`) }))
    .sort((a, b) => b.priority - a.priority);
}

// ── AI CHECKER ────────────────────────────────────────────────────────────────

async function checkAnswer({ type, question, correctAnswer, userAnswer, module, apiKey }) {
  const sys = `You are a strict but fair data analytics interview coach evaluating ${module.toUpperCase()} answers. Respond ONLY with valid JSON — no markdown, no extra text.
Format: {"score":"strong"|"partial"|"weak","summary":"One sentence verdict.","got_right":["..."],"missed":["..."],"coaching":"1-2 sentence coaching tip."}
Be direct. If answer is blank, score weak immediately.`;
  const prompt = type === "code"
    ? `Type: ${module.toUpperCase()} coding\nPrompt: ${question}\nModel solution: ${correctAnswer}\nCandidate: ${userAnswer || "(blank)"}\nEvaluate logic and approach. Minor syntax differences ok if concept is right.`
    : `Type: ${module.toUpperCase()} concept\nQuestion: ${question}\nCorrect: ${correctAnswer}\nCandidate: ${userAnswer || "(blank)"}\nEvaluate whether key concepts are covered.`;
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
      body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system: sys, messages: [{ role: "user", content: prompt }] }),
    });
    const data = await res.json();
    if (data.error) return { score: "weak", summary: `API error: ${data.error.message}`, got_right: [], missed: [], coaching: "Check your API key." };
    const raw = data.content?.[0]?.text || "{}";
    return JSON.parse(raw.replace(/```json|```/g, "").trim());
  } catch {
    return { score: "weak", summary: "Request failed — check your API key.", got_right: [], missed: [], coaching: "Make sure your key starts with sk-ant-." };
  }
}

// ── SHARED UI ─────────────────────────────────────────────────────────────────

function Badge({ level }) {
  const col = { Basic: C.ok, Intermediate: C.accent, Advanced: C.err }[level] || C.ok;
  return <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", color: col, background: col + "18", border: `1px solid ${col}33`, borderRadius: 4, padding: "2px 7px", fontFamily: mono, textTransform: "uppercase" }}>{level}</span>;
}

function ScorePill({ score }) {
  const [col, label] = { strong: [C.ok, "✓ Strong"], partial: [C.warn, "◑ Partial"], weak: [C.err, "✗ Weak"] }[score] || [C.err, "✗ Weak"];
  return <span style={{ fontSize: 11, fontWeight: 700, color: col, background: col + "18", border: `1px solid ${col}44`, borderRadius: 4, padding: "3px 10px", fontFamily: mono }}>{label}</span>;
}

function Spinner() {
  return <>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    <div style={{ width: 14, height: 14, border: `2px solid ${C.accent}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite", flexShrink: 0 }} />
  </>;
}

function AIFeedback({ result, loading }) {
  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 0" }}>
      <Spinner />
      <span style={{ color: C.muted, fontFamily: mono, fontSize: 12 }}>Evaluating your answer...</span>
    </div>
  );
  if (!result) return null;
  return (
    <div style={{ background: C.surface, border: `1.5px solid ${C.border}`, borderRadius: 10, overflow: "hidden", marginTop: 14 }}>
      <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <ScorePill score={result.score} />
        <span style={{ fontSize: 13, color: C.text }}>{result.summary}</span>
      </div>
      {(result.got_right?.length > 0 || result.missed?.length > 0) && (
        <div style={{ padding: "14px 16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {result.got_right?.length > 0 && (
            <div>
              <div style={{ fontSize: 9, fontFamily: mono, color: C.ok, letterSpacing: "0.12em", marginBottom: 7 }}>GOT RIGHT</div>
              {result.got_right.map((item, i) => <div key={i} style={{ fontSize: 12, color: C.text, lineHeight: 1.65, display: "flex", gap: 6, marginBottom: 4 }}><span style={{ color: C.ok, flexShrink: 0 }}>✓</span>{item}</div>)}
            </div>
          )}
          {result.missed?.length > 0 && (
            <div>
              <div style={{ fontSize: 9, fontFamily: mono, color: C.err, letterSpacing: "0.12em", marginBottom: 7 }}>MISSED</div>
              {result.missed.map((item, i) => <div key={i} style={{ fontSize: 12, color: C.text, lineHeight: 1.65, display: "flex", gap: 6, marginBottom: 4 }}><span style={{ color: C.err, flexShrink: 0 }}>✗</span>{item}</div>)}
            </div>
          )}
        </div>
      )}
      {result.coaching && (
        <div style={{ padding: "10px 16px", borderTop: `1px solid ${C.border}`, background: C.accent + "08" }}>
          <span style={{ color: C.accent, fontFamily: mono, fontSize: 9, letterSpacing: "0.12em" }}>COACH: </span>
          <span style={{ fontSize: 12, color: C.text, lineHeight: 1.7 }}>{result.coaching}</span>
        </div>
      )}
    </div>
  );
}

function TArea({ value, onChange, placeholder, rows = 4 }) {
  return (
    <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
      style={{ width: "100%", background: "#09090f", border: `1.5px solid ${C.border}`, borderRadius: 8, padding: "12px 14px", boxSizing: "border-box", color: C.text, fontFamily: mono, fontSize: 13, lineHeight: 1.7, resize: "vertical", outline: "none" }}
      onFocus={e => e.target.style.borderColor = C.accent}
      onBlur={e => e.target.style.borderColor = C.border}
    />
  );
}

function Btn({ onClick, children, color = C.accent, outline = false, disabled = false, small = false }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background: outline ? "transparent" : color, color: outline ? color : C.bg,
      border: `1.5px solid ${color}`, borderRadius: 6,
      padding: small ? "5px 12px" : "7px 16px",
      fontFamily: mono, fontSize: small ? 11 : 12, fontWeight: 600,
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.45 : 1, letterSpacing: "0.04em",
    }}>{children}</button>
  );
}

// ── STATS PANEL ───────────────────────────────────────────────────────────────

function StatsPanel({ progress, onResetProgress }) {
  const allScores = Object.values(progress.allTimeScores);
  const strong = allScores.filter(s => s === "strong").length;
  const partial = allScores.filter(s => s === "partial").length;
  const weak = allScores.filter(s => s === "weak").length;
  const total = allScores.length;
  const pct = total > 0 ? Math.round((strong / total) * 100) : 0;

  return (
    <div style={{ background: C.card, border: `1.5px solid ${C.border}`, borderRadius: 12, padding: "18px 20px", marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontFamily: mono, fontSize: 10, color: C.muted, letterSpacing: "0.12em" }}>ALL-TIME PROGRESS</div>
        <button onClick={onResetProgress} style={{ background: "transparent", border: "none", color: C.muted, fontFamily: mono, fontSize: 10, cursor: "pointer" }}>reset</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, textAlign: "center" }}>
        {[
          [progress.streak, "STREAK", C.accent, "\ud83d\udd25"],
          [progress.totalSessions, "SESSIONS", C.text, "\ud83d\udcc5"],
          [strong, "STRONG", C.ok, "✓"],
          [partial, "PARTIAL", C.warn, "◑"],
          [weak, "WEAK", C.err, "✗"],
        ].map(([val, label, col, icon]) => (
          <div key={label}>
            <div style={{ fontSize: 22, fontWeight: 700, color: col }}>{val}</div>
            <div style={{ fontSize: 9, color: C.muted, fontFamily: mono, letterSpacing: "0.1em", marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>
      {total > 0 && (
        <div style={{ marginTop: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: mono, fontSize: 10, color: C.muted, marginBottom: 5 }}>
            <span>Strong rate</span><span style={{ color: pct >= 70 ? C.ok : pct >= 40 ? C.warn : C.err }}>{pct}%</span>
          </div>
          <div style={{ height: 4, background: C.border, borderRadius: 2, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: pct >= 70 ? C.ok : pct >= 40 ? C.warn : C.err, borderRadius: 2, transition: "width 0.4s" }} />
          </div>
        </div>
      )}
      {progress.weakQueue?.length > 0 && (
        <div style={{ marginTop: 12, padding: "8px 12px", background: C.err + "0d", border: `1px solid ${C.err}33`, borderRadius: 7, fontFamily: mono, fontSize: 11, color: C.err }}>
          ✗ {progress.weakQueue.length} questions flagged for review
        </div>
      )}
    </div>
  );
}

// ── FLASHCARD MODE ────────────────────────────────────────────────────────────

function FlashcardMode({ module, apiKey, progress, onScore }) {
  const rawCards = FLASHCARDS[module] || [];
  const color = MODULES.find(m => m.id === module)?.color || C.accent;
  // Sort by spaced repetition priority on mount — weak/unseen surfaces first, mastered last
  const [sorted] = useState(() => sortCardsBySpacedRep(rawCards, module, progress));
  const [idx, setIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [sessionScores, setSessionScores] = useState({});
  const entry = sorted[idx] || { card: rawCards[0], origIdx: 0 };
  const card = entry.card;
  const origIdx = entry.origIdx;

  const goTo = (i) => { setIdx(i); setUserAnswer(""); setFeedback(null); setRevealed(false); };

  const evaluate = async () => {
    if (!userAnswer.trim() || !apiKey) return;
    setLoading(true); setFeedback(null);
    const result = await checkAnswer({ type: "flashcard", question: card.q, correctAnswer: card.a, userAnswer, module, apiKey });
    setFeedback(result);
    setSessionScores(s => ({ ...s, [idx]: result.score }));
    onScore(module, origIdx, result.score, card);
    setLoading(false);
  };

  const strong = Object.values(sessionScores).filter(v => v === "strong").length;
  const partial = Object.values(sessionScores).filter(v => v === "partial").length;
  const weak = Object.values(sessionScores).filter(v => v === "weak").length;

  // Show persisted score using the original card index
  const persistedScore = progress.allTimeScores[`${module}:${origIdx}`];
  // Show spaced rep hint when card has history
  const counts = progress.scoreCounts?.[`${module}:${origIdx}`];
  const lastSeen = progress.lastSeen?.[`${module}:${origIdx}`];
  const daysSince = lastSeen ? Math.floor((Date.now() - new Date(lastSeen)) / 86400000) : null;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14, alignItems: "center" }}>
        <div style={{ display: "flex", gap: 14, fontFamily: mono, fontSize: 11 }}>
          <span style={{ color: C.ok }}>✓ {strong}</span>
          <span style={{ color: C.warn }}>◑ {partial}</span>
          <span style={{ color: C.err }}>✗ {weak}</span>
        </div>
        <span style={{ fontFamily: mono, fontSize: 11, color: C.muted }}>{idx + 1} / {sorted.length}</span>
      </div>
      <div style={{ height: 3, background: C.border, borderRadius: 2, marginBottom: 20, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${(idx / sorted.length) * 100}%`, background: color, transition: "width 0.3s" }} />
      </div>
      <div style={{ background: C.card, border: `1.5px solid ${C.border}`, borderRadius: 12, padding: "20px 22px", marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
          <Badge level={card.level} />
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {persistedScore && <span style={{ fontFamily: mono, fontSize: 9, color: C.muted }}>LAST: <ScorePill score={persistedScore} /></span>}
            {(sessionScores[idx] && !persistedScore) && <ScorePill score={sessionScores[idx]} />}
          </div>
        </div>
        <div style={{ fontSize: 16, lineHeight: 1.65, color: C.text, fontWeight: 500 }}>{card.q}</div>
      </div>
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontFamily: mono, fontSize: 9, color: C.muted, letterSpacing: "0.12em", marginBottom: 6 }}>YOUR ANSWER</div>
        <TArea value={userAnswer} onChange={setUserAnswer} placeholder="Type your answer before checking or revealing..." rows={4} />
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        <Btn onClick={evaluate} disabled={loading || !userAnswer.trim() || !apiKey} color={color}>
          {loading ? "Checking..." : "⚡ Check My Answer"}
        </Btn>
        <Btn onClick={() => setRevealed(!revealed)} outline color={C.muted}>{revealed ? "Hide answer" : "Reveal answer"}</Btn>
        <Btn onClick={() => goTo((idx - 1 + sorted.length) % sorted.length)} outline color={C.muted}>← Prev</Btn>
        <Btn onClick={() => goTo((idx + 1) % sorted.length)} outline color={C.muted}>Next →</Btn>
      </div>
      <AIFeedback result={feedback} loading={loading} />
      {revealed && (
        <div style={{ marginTop: 14, padding: "14px 18px", background: color + "0a", border: `1.5px solid ${color}33`, borderRadius: 10 }}>
          <div style={{ fontFamily: mono, fontSize: 9, color, letterSpacing: "0.12em", marginBottom: 8 }}>MODEL ANSWER</div>
          <div style={{ fontSize: 14, lineHeight: 1.75, color: C.text }}>{card.a}</div>
        </div>
      )}
    </div>
  );
}

// ── CODING MODE ───────────────────────────────────────────────────────────────

function CodingMode({ module, apiKey, onScore }) {
  const challenges = CODING[module] || [];
  const color = MODULES.find(m => m.id === module)?.color || C.accent;
  const [idx, setIdx] = useState(0);
  const [userCode, setUserCode] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [showHint, setShowHint] = useState(false);

  if (!challenges.length) return (
    <div style={{ padding: 40, textAlign: "center", color: C.muted, fontFamily: mono, fontSize: 13 }}>
      Coding challenges for {module.toUpperCase()} coming soon.
    </div>
  );

  const ch = challenges[idx];
  const goTo = (i) => { setIdx(i); setUserCode(""); setFeedback(null); setShowSolution(false); setShowHint(false); };

  const evaluate = async () => {
    if (!userCode.trim() || !apiKey) return;
    setLoading(true); setFeedback(null);
    const result = await checkAnswer({ type: "code", question: ch.prompt, correctAnswer: ch.solution, userAnswer: userCode, module, apiKey });
    setFeedback(result);
    onScore(`${module}-code`, idx, result.score, { q: ch.prompt });
    setLoading(false);
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
        {challenges.map((c, i) => (
          <button key={i} onClick={() => goTo(i)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", background: idx === i ? color + "20" : "transparent", border: `1.5px solid ${idx === i ? color : C.border}`, borderRadius: 6, cursor: "pointer" }}>
            <Badge level={c.level} />
          </button>
        ))}
      </div>
      <div style={{ background: C.card, border: `1.5px solid ${C.border}`, borderRadius: 12, padding: "18px 22px", marginBottom: 14 }}>
        <div style={{ fontFamily: mono, fontSize: 9, color: C.muted, letterSpacing: "0.12em", marginBottom: 10 }}>PROMPT</div>
        <pre style={{ margin: 0, fontSize: 13, lineHeight: 1.75, color: C.text, fontFamily: sans, whiteSpace: "pre-wrap" }}>{ch.prompt}</pre>
      </div>
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontFamily: mono, fontSize: 9, color: C.muted, letterSpacing: "0.12em", marginBottom: 6 }}>YOUR CODE</div>
        <TArea value={userCode} onChange={setUserCode} placeholder="Write your solution here..." rows={7} />
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
        <Btn onClick={evaluate} disabled={loading || !userCode.trim() || !apiKey} color={color}>{loading ? "Checking..." : "⚡ Check My Code"}</Btn>
        <Btn onClick={() => setShowHint(!showHint)} outline color={C.accent}>{showHint ? "Hide hint" : "\ud83d\udca1 Hint"}</Btn>
        <Btn onClick={() => setShowSolution(!showSolution)} outline color={C.muted}>{showSolution ? "Hide solution" : "Show solution"}</Btn>
      </div>
      {showHint && <div style={{ marginBottom: 12, padding: "10px 14px", background: C.accent + "0d", border: `1px solid ${C.accent}33`, borderRadius: 8, fontFamily: mono, fontSize: 12, color: C.accent }}>\ud83d\udca1 {ch.hint}</div>}
      <AIFeedback result={feedback} loading={loading} />
      {showSolution && (
        <div style={{ marginTop: 14 }}>
          <div style={{ fontFamily: mono, fontSize: 9, color, letterSpacing: "0.12em", marginBottom: 8 }}>MODEL SOLUTION</div>
          <pre style={{ background: "#09090f", border: `1.5px solid ${color}44`, borderRadius: 10, padding: "16px 20px", margin: 0, color: C.text, fontFamily: mono, fontSize: 12, lineHeight: 1.8, overflowX: "auto", whiteSpace: "pre-wrap" }}>{ch.solution}</pre>
        </div>
      )}
    </div>
  );
}

// ── QUICKFIRE MODE ────────────────────────────────────────────────────────────

function QuickFireMode({ apiKey, onScore, onSessionComplete }) {
  const [shuffled] = useState(() => [...QUICKFIRE].sort(() => Math.random() - 0.5));
  const [idx, setIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [history, setHistory] = useState([]);
  const [done, setDone] = useState(false);
  const q = shuffled[idx];

  const evaluate = async () => {
    if (!userAnswer.trim() || !apiKey) return;
    setLoading(true); setFeedback(null);
    const result = await checkAnswer({ type: "flashcard", question: q.q, correctAnswer: q.a, userAnswer, module: "general analytics", apiKey });
    setFeedback(result);
    setLoading(false);
  };

  const advance = (score) => {
    onScore("quickfire", idx, score, q);
    setHistory(h => [...h, score]);
    if (idx + 1 >= shuffled.length) { setDone(true); onSessionComplete(); return; }
    setIdx(idx + 1); setUserAnswer(""); setFeedback(null); setRevealed(false);
  };

  const strong = history.filter(v => v === "strong").length;
  const partial = history.filter(v => v === "partial").length;
  const weak = history.filter(v => v === "weak").length;

  if (done) return (
    <div style={{ textAlign: "center", padding: "40px 20px" }}>
      <div style={{ fontSize: 48, marginBottom: 14 }}>⚡</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: C.text, marginBottom: 6 }}>Round Complete</div>
      <div style={{ fontFamily: mono, fontSize: 11, color: C.muted, marginBottom: 28 }}>{shuffled.length} QUESTIONS FIRED</div>
      <div style={{ display: "flex", gap: 28, justifyContent: "center", marginBottom: 32 }}>
        {[[C.ok, strong, "STRONG"], [C.warn, partial, "PARTIAL"], [C.err, weak, "WEAK"]].map(([col, val, label]) => (
          <div key={label} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 36, fontWeight: 700, color: col }}>{val}</div>
            <div style={{ fontSize: 9, color: C.muted, fontFamily: mono, letterSpacing: "0.12em", marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 32, fontWeight: 700, color: C.accent }}>{Math.round((strong / shuffled.length) * 100)}%</div>
      <div style={{ fontFamily: mono, fontSize: 10, color: C.muted, letterSpacing: "0.12em", marginBottom: 28 }}>STRONG RATE</div>
      <Btn onClick={() => { setIdx(0); setUserAnswer(""); setFeedback(null); setRevealed(false); setHistory([]); setDone(false); }}>Run Again ↺</Btn>
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14, alignItems: "center" }}>
        <div style={{ fontFamily: mono, fontSize: 11, color: C.muted }}>⚡ {idx + 1} / {shuffled.length}</div>
        <div style={{ display: "flex", gap: 12, fontFamily: mono, fontSize: 11 }}>
          <span style={{ color: C.ok }}>{strong} strong</span>
          <span style={{ color: C.warn }}>{partial} partial</span>
          <span style={{ color: C.err }}>{weak} weak</span>
        </div>
      </div>
      <div style={{ height: 3, background: C.border, borderRadius: 2, marginBottom: 20, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${(idx / shuffled.length) * 100}%`, background: C.accent, transition: "width 0.2s" }} />
      </div>
      <div style={{ background: C.card, border: `1.5px solid ${C.border}`, borderRadius: 12, padding: "18px 22px", marginBottom: 14 }}>
        <div style={{ fontFamily: mono, fontSize: 9, color: C.muted, letterSpacing: "0.12em", marginBottom: 10 }}>QUESTION</div>
        <div style={{ fontSize: 16, lineHeight: 1.65, color: C.text, fontWeight: 500 }}>{q.q}</div>
      </div>
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontFamily: mono, fontSize: 9, color: C.muted, letterSpacing: "0.12em", marginBottom: 6 }}>YOUR ANSWER</div>
        <TArea value={userAnswer} onChange={setUserAnswer} placeholder="Answer fast — this is quick-fire..." rows={3} />
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        <Btn onClick={evaluate} disabled={loading || !userAnswer.trim() || !apiKey} color={C.accent}>{loading ? "Checking..." : "⚡ Check"}</Btn>
        <Btn onClick={() => setRevealed(!revealed)} outline color={C.muted}>{revealed ? "Hide" : "Reveal"}</Btn>
        {feedback
          ? <Btn onClick={() => advance(feedback.score)} color={C.ok} outline>Next →</Btn>
          : <Btn onClick={() => advance("weak")} outline color={C.muted}>Skip →</Btn>
        }
      </div>
      <AIFeedback result={feedback} loading={loading} />
      {revealed && (
        <div style={{ marginTop: 14, padding: "12px 16px", background: C.accent + "0a", border: `1px solid ${C.accent}33`, borderRadius: 8 }}>
          <div style={{ fontFamily: mono, fontSize: 9, color: C.accent, letterSpacing: "0.12em", marginBottom: 6 }}>ANSWER</div>
          <div style={{ fontSize: 13, lineHeight: 1.7, color: C.text }}>{q.a}</div>
        </div>
      )}
    </div>
  );
}

// ── SESSION SUMMARY ────────────────────────────────────────────────────────────

function SessionSummary({ summary, onClose, onDrillWeaks }) {
  if (!summary) return null;
  const { mode, questionsAnswered, strong, partial, weak, durationMin, topMissed } = summary;
  const pct = questionsAnswered > 0 ? Math.round((strong / questionsAnswered) * 100) : 0;
  const grade = pct >= 85 ? { g: "A", col: C.ok } : pct >= 70 ? { g: "B", col: C.ok } : pct >= 55 ? { g: "C", col: C.warn } : { g: "D", col: C.err };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 }}>
      <div style={{ background: C.surface, border: `1.5px solid ${C.border}`, borderRadius: 16, padding: "28px 28px 24px", maxWidth: 460, width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <div style={{ fontFamily: mono, fontSize: 10, color: C.muted, letterSpacing: "0.12em", marginBottom: 4 }}>SESSION COMPLETE — {mode?.toUpperCase()}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: C.text }}>{durationMin}min session</div>
          </div>
          <div style={{ fontSize: 36, fontWeight: 900, color: grade.col }}>{grade.g}</div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 20 }}>
          {[
            [questionsAnswered, "ANSWERED", C.text],
            [strong, "STRONG", C.ok],
            [partial, "PARTIAL", C.warn],
            [weak, "WEAK", C.err],
          ].map(([val, lbl, col]) => (
            <div key={lbl} style={{ textAlign: "center", background: C.card, borderRadius: 8, padding: "10px 4px" }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: col }}>{val}</div>
              <div style={{ fontFamily: mono, fontSize: 8, color: C.muted, letterSpacing: "0.1em", marginTop: 2 }}>{lbl}</div>
            </div>
          ))}
        </div>

        {/* Strong rate bar */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: mono, fontSize: 10, color: C.muted, marginBottom: 5 }}>
            <span>Strong rate</span><span style={{ color: grade.col }}>{pct}%</span>
          </div>
          <div style={{ height: 6, background: C.border, borderRadius: 3, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: grade.col, borderRadius: 3, transition: "width 0.5s" }} />
          </div>
        </div>

        {/* Top missed topics */}
        {topMissed?.length > 0 && (
          <div style={{ marginBottom: 20, padding: "12px 14px", background: C.err + "0d", border: `1px solid ${C.err}33`, borderRadius: 8 }}>
            <div style={{ fontFamily: mono, fontSize: 9, color: C.err, letterSpacing: "0.12em", marginBottom: 8 }}>FOCUS AREAS</div>
            {topMissed.slice(0, 3).map((q, i) => (
              <div key={i} style={{ fontSize: 12, color: C.text, lineHeight: 1.5, marginBottom: 4, display: "flex", gap: 6 }}>
                <span style={{ color: C.err, flexShrink: 0 }}>✗</span>{q}
              </div>
            ))}
          </div>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          {(weak > 0 || partial > 0) && (
            <button onClick={onDrillWeaks} style={{
              flex: 1, padding: "9px", background: C.err + "20", border: `1.5px solid ${C.err}55`,
              borderRadius: 7, fontFamily: mono, fontSize: 11, fontWeight: 700, color: C.err, cursor: "pointer"
            }}>🎯 Drill Weaks ({weak + partial})</button>
          )}
          <button onClick={onClose} style={{
            flex: 1, padding: "9px", background: C.accent, border: "none",
            borderRadius: 7, fontFamily: mono, fontSize: 11, fontWeight: 700, color: C.bg, cursor: "pointer"
          }}>Continue ✓</button>
        </div>
      </div>
    </div>
  );
}

// ── DOMAIN PACK MODE ───────────────────────────────────────────────────────────

function DomainPackMode({ pack, apiKey, progress, onScore, onSessionDone }) {
  const questions = pack.questions;
  const [idx, setIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [sessionScores, setSessionScores] = useState({});
  const [sessionStart] = useState(Date.now());
  const card = questions[idx];

  const goTo = (i) => { setIdx(i); setUserAnswer(""); setFeedback(null); setRevealed(false); };

  const evaluate = async () => {
    if (!userAnswer.trim() || !apiKey) return;
    setLoading(true); setFeedback(null);
    const result = await checkAnswer({
      type: "flashcard", question: card.q, correctAnswer: card.a,
      userAnswer, module: `${pack.id} analytics`, apiKey
    });
    setFeedback(result);
    const newScores = { ...sessionScores, [idx]: result.score };
    setSessionScores(newScores);
    onScore(`domain-${pack.id}`, idx, result.score, card);
    setLoading(false);
  };

  const finishSession = () => {
    const strong = Object.values(sessionScores).filter(v => v === "strong").length;
    const partial = Object.values(sessionScores).filter(v => v === "partial").length;
    const weak = Object.values(sessionScores).filter(v => v === "weak").length;
    const answered = Object.keys(sessionScores).length;
    onSessionDone({
      mode: `${pack.label} Pack`,
      questionsAnswered: answered,
      strong, partial, weak,
      durationMin: Math.round((Date.now() - sessionStart) / 60000),
      topMissed: questions.filter((_, i) => sessionScores[i] === "weak").map(q => q.q).slice(0, 3),
    });
  };

  const strong = Object.values(sessionScores).filter(v => v === "strong").length;
  const partial = Object.values(sessionScores).filter(v => v === "partial").length;
  const weak = Object.values(sessionScores).filter(v => v === "weak").length;
  const persistedScore = progress.allTimeScores[`domain-${pack.id}:${idx}`];

  return (
    <div>
      {/* Pack header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, padding: "10px 14px", background: pack.color + "12", border: `1px solid ${pack.color}33`, borderRadius: 8 }}>
        <span style={{ fontSize: 18 }}>{pack.icon}</span>
        <div>
          <div style={{ fontFamily: mono, fontSize: 11, fontWeight: 700, color: pack.color }}>{pack.label}</div>
          <div style={{ fontFamily: mono, fontSize: 9, color: C.muted }}>{pack.description}</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 12, fontFamily: mono, fontSize: 11 }}>
          <span style={{ color: C.ok }}>✓ {strong}</span>
          <span style={{ color: C.warn }}>◑ {partial}</span>
          <span style={{ color: C.err }}>✗ {weak}</span>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, alignItems: "center" }}>
        <span style={{ fontFamily: mono, fontSize: 11, color: C.muted }}>{idx + 1} / {questions.length}</span>
        {Object.keys(sessionScores).length >= 5 && (
          <button onClick={finishSession} style={{ fontFamily: mono, fontSize: 10, color: C.accent, background: "transparent", border: `1px solid ${C.accent}44`, borderRadius: 5, padding: "4px 10px", cursor: "pointer" }}>
            End & Summary →
          </button>
        )}
      </div>

      <div style={{ height: 3, background: C.border, borderRadius: 2, marginBottom: 20, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${(idx / questions.length) * 100}%`, background: pack.color, transition: "width 0.3s" }} />
      </div>

      <div style={{ background: C.card, border: `1.5px solid ${pack.color}33`, borderRadius: 12, padding: "20px 22px", marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
          <Badge level={card.level} />
          {persistedScore && <ScorePill score={persistedScore} />}
        </div>
        <div style={{ fontSize: 15, lineHeight: 1.7, color: C.text, fontWeight: 500, whiteSpace: "pre-wrap" }}>{card.q}</div>
      </div>

      <div style={{ marginBottom: 10 }}>
        <div style={{ fontFamily: mono, fontSize: 9, color: C.muted, letterSpacing: "0.12em", marginBottom: 6 }}>YOUR ANSWER</div>
        <TArea value={userAnswer} onChange={setUserAnswer} placeholder="Answer as you would in an interview — include relevant context and examples..." rows={5} />
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        <Btn onClick={evaluate} disabled={loading || !userAnswer.trim() || !apiKey} color={pack.color}>
          {loading ? "Checking..." : "⚡ Check My Answer"}
        </Btn>
        <Btn onClick={() => setRevealed(!revealed)} outline color={C.muted}>{revealed ? "Hide answer" : "Reveal answer"}</Btn>
        <Btn onClick={() => goTo((idx - 1 + questions.length) % questions.length)} outline color={C.muted}>← Prev</Btn>
        <Btn onClick={() => goTo((idx + 1) % questions.length)} outline color={C.muted}>Next →</Btn>
      </div>

      <AIFeedback result={feedback} loading={loading} />

      {revealed && (
        <div style={{ marginTop: 14, padding: "14px 18px", background: pack.color + "0a", border: `1.5px solid ${pack.color}33`, borderRadius: 10 }}>
          <div style={{ fontFamily: mono, fontSize: 9, color: pack.color, letterSpacing: "0.12em", marginBottom: 8 }}>MODEL ANSWER</div>
          <div style={{ fontSize: 13, lineHeight: 1.8, color: C.text, whiteSpace: "pre-wrap", fontFamily: mono }}>{card.a}</div>
        </div>
      )}
    </div>
  );
}

// ── WEAK QUEUE DRILL ──────────────────────────────────────────────────────────

function WeakQueueMode({ apiKey, progress, onScore }) {
  const queue = progress.weakQueue || [];
  const [idx, setIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [cleared, setCleared] = useState([]);

  if (queue.length === 0) return (
    <div style={{ textAlign: "center", padding: "50px 20px" }}>
      <div style={{ fontSize: 40, marginBottom: 14 }}>✓</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: C.ok, marginBottom: 8 }}>Queue Clear</div>
      <div style={{ fontFamily: mono, fontSize: 12, color: C.muted, lineHeight: 1.7 }}>
        No weak or partial answers flagged.<br />
        Keep practicing — flags appear when you score weak or partial on any question.
      </div>
    </div>
  );

  const remaining = queue.filter(w => !cleared.includes(w.key));

  if (remaining.length === 0) return (
    <div style={{ textAlign: "center", padding: "50px 20px" }}>
      <div style={{ fontSize: 40, marginBottom: 14 }}>🔥</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: C.ok, marginBottom: 8 }}>Drill Complete!</div>
      <div style={{ fontFamily: mono, fontSize: 12, color: C.muted, marginBottom: 24 }}>
        You cleared all {cleared.length} flagged question{cleared.length !== 1 ? "s" : ""}.
      </div>
      <Btn onClick={() => setCleared([])}>Drill Again ↺</Btn>
    </div>
  );

  const safeIdx = Math.min(idx, remaining.length - 1);
  const item = remaining[safeIdx];

  // Resolve the actual flashcard from FLASHCARDS using mod + idx stored
  const allCards = Object.entries(FLASHCARDS).flatMap(([mod, cards]) =>
    cards.map((c, i) => ({ ...c, mod, cardIdx: i, key: `${mod}:${i}` }))
  );
  const card = allCards.find(c => c.key === item.key);
  const question = card?.q || item.q || "(Question not found)";
  const answer = card?.a || "";
  const modLabel = item.mod?.replace(/-code$/, "")?.toUpperCase() || "";
  const color = MODULES.find(m => m.id === item.mod?.replace(/-code$/, ""))?.color || C.accent;

  const goTo = (i) => { setIdx(i); setUserAnswer(""); setFeedback(null); setRevealed(false); };

  const evaluate = async () => {
    if (!userAnswer.trim() || !apiKey || !card) return;
    setLoading(true); setFeedback(null);
    const mod = item.mod?.replace(/-code$/, "") || "sql";
    const result = await checkAnswer({ type: "flashcard", question, correctAnswer: answer, userAnswer, module: mod, apiKey });
    setFeedback(result);
    setLoading(false);
    if (result.score === "strong") {
      onScore(item.mod, item.idx, result.score, { q: question });
      setTimeout(() => {
        setCleared(c => [...c, item.key]);
        const nextIdx = safeIdx >= remaining.length - 2 ? Math.max(0, safeIdx - 1) : safeIdx;
        goTo(nextIdx);
      }, 1200);
    } else {
      onScore(item.mod, item.idx, result.score, { q: question });
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14, alignItems: "center" }}>
        <div style={{ fontFamily: mono, fontSize: 11, color: C.err }}>
          ✗ {remaining.length} in queue {cleared.length > 0 && <span style={{ color: C.ok }}>· {cleared.length} cleared this session</span>}
        </div>
        <span style={{ fontFamily: mono, fontSize: 11, color: C.muted }}>{safeIdx + 1} / {remaining.length}</span>
      </div>

      <div style={{ height: 3, background: C.border, borderRadius: 2, marginBottom: 20, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${(cleared.length / (cleared.length + remaining.length)) * 100}%`, background: C.ok, transition: "width 0.4s" }} />
      </div>

      <div style={{ background: C.card, border: `1.5px solid ${C.err}44`, borderRadius: 12, padding: "20px 22px", marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {card && <Badge level={card.level} />}
            <span style={{ fontFamily: mono, fontSize: 9, color: color, letterSpacing: "0.1em" }}>{modLabel}</span>
          </div>
          <span style={{ fontFamily: mono, fontSize: 9, color: C.err, background: C.err + "15", padding: "2px 8px", borderRadius: 4 }}>NEEDS WORK</span>
        </div>
        <div style={{ fontSize: 16, lineHeight: 1.65, color: C.text, fontWeight: 500 }}>{question}</div>
      </div>

      <div style={{ marginBottom: 10 }}>
        <div style={{ fontFamily: mono, fontSize: 9, color: C.muted, letterSpacing: "0.12em", marginBottom: 6 }}>YOUR ANSWER — Score strong to clear this card</div>
        <TArea value={userAnswer} onChange={setUserAnswer} placeholder="Type your answer. Score Strong to remove from queue..." rows={4} />
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        <Btn onClick={evaluate} disabled={loading || !userAnswer.trim() || !apiKey} color={C.err}>
          {loading ? "Checking..." : "⚡ Check"}
        </Btn>
        <Btn onClick={() => setRevealed(!revealed)} outline color={C.muted}>{revealed ? "Hide answer" : "Reveal answer"}</Btn>
        <Btn onClick={() => goTo(safeIdx > 0 ? safeIdx - 1 : remaining.length - 1)} outline color={C.muted}>← Prev</Btn>
        <Btn onClick={() => goTo((safeIdx + 1) % remaining.length)} outline color={C.muted}>Next →</Btn>
      </div>

      {feedback && (
        <div style={{ marginBottom: 14, padding: "10px 14px", background: feedback.score === "strong" ? C.ok + "15" : C.warn + "15", border: `1px solid ${feedback.score === "strong" ? C.ok : C.warn}44`, borderRadius: 8, fontFamily: mono, fontSize: 12 }}>
          {feedback.score === "strong"
            ? <span style={{ color: C.ok }}>✓ Strong! Removing from queue...</span>
            : <span style={{ color: C.warn }}>◑ {feedback.score === "partial" ? "Partial" : "Weak"} — keep drilling this one</span>
          }
          {feedback.coaching && <div style={{ color: C.text, marginTop: 6, lineHeight: 1.6 }}>{feedback.coaching}</div>}
        </div>
      )}

      <AIFeedback result={feedback} loading={loading} />

      {revealed && answer && (
        <div style={{ marginTop: 14, padding: "14px 18px", background: color + "0a", border: `1.5px solid ${color}33`, borderRadius: 10 }}>
          <div style={{ fontFamily: mono, fontSize: 9, color, letterSpacing: "0.12em", marginBottom: 8 }}>MODEL ANSWER</div>
          <div style={{ fontSize: 14, lineHeight: 1.75, color: C.text }}>{answer}</div>
        </div>
      )}
    </div>
  );
}

// ── INTERVIEW SIMULATION MODE ─────────────────────────────────────────────────

const INTERVIEW_POOL = Object.entries(FLASHCARDS).flatMap(([mod, cards]) =>
  cards.map((c, i) => ({ ...c, mod, cardIdx: i }))
);

function InterviewSimMode({ apiKey, onSessionComplete }) {
  const [phase, setPhase] = useState("config"); // config | active | debrief
  const [config, setConfig] = useState({ modules: ["sql", "excel", "tableau", "python"], difficulty: "Mixed", count: 10 });
  const [questions, setQuestions] = useState([]);
  const [qIdx, setQIdx] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [current, setCurrent] = useState("");
  const [timeLeft, setTimeLeft] = useState(90);
  const [timerActive, setTimerActive] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [results, setResults] = useState([]);
  const [debriefLoading, setDebriefLoading] = useState(false);

  // Timer
  useEffect(() => {
    if (!timerActive || phase !== "active") return;
    if (timeLeft <= 0) { submitAnswer(); return; }
    const t = setTimeout(() => setTimeLeft(n => n - 1), 1000);
    return () => clearTimeout(t);
  }, [timerActive, timeLeft, phase]);

  const startInterview = () => {
    let pool = INTERVIEW_POOL.filter(q => config.modules.includes(q.mod));
    if (config.difficulty !== "Mixed") pool = pool.filter(q => q.level === config.difficulty);
    if (pool.length === 0) pool = INTERVIEW_POOL;
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, config.count);
    setQuestions(shuffled);
    setAnswers([]);
    setResults([]);
    setQIdx(0);
    setCurrent("");
    setTimeLeft(90);
    setTimerActive(true);
    setPhase("active");
  };

  const submitAnswer = async () => {
    if (evaluating) return;
    setTimerActive(false);
    setEvaluating(true);
    const q = questions[qIdx];
    const ans = current.trim() || "(no answer)";
    const result = await checkAnswer({
      type: "flashcard", question: q.q, correctAnswer: q.a, userAnswer: ans, module: q.mod, apiKey
    });
    const newResults = [...results, { q: q.q, a: q.a, userAnswer: ans, mod: q.mod, level: q.level, score: result }];
    setResults(newResults);
    setAnswers(prev => [...prev, ans]);
    setEvaluating(false);

    if (qIdx + 1 >= questions.length) {
      setPhase("debrief");
      if (onSessionComplete) onSessionComplete();
    } else {
      setQIdx(qIdx + 1);
      setCurrent("");
      setTimeLeft(90);
      setTimerActive(true);
    }
  };

  const letterGrade = (pct) => {
    if (pct >= 85) return { grade: "A", color: C.ok, label: "Strong candidate" };
    if (pct >= 70) return { grade: "B", color: C.ok, label: "Above average" };
    if (pct >= 55) return { grade: "C", color: C.warn, label: "Mixed performance" };
    return { grade: "D", color: C.err, label: "Needs more prep" };
  };

  if (phase === "config") return (
    <div>
      <div style={{ fontFamily: mono, fontSize: 10, color: C.muted, letterSpacing: "0.12em", marginBottom: 18 }}>CONFIGURE INTERVIEW</div>

      <div style={{ background: C.card, border: `1.5px solid ${C.border}`, borderRadius: 12, padding: "20px 22px", marginBottom: 16 }}>
        <div style={{ fontFamily: mono, fontSize: 10, color: C.muted, letterSpacing: "0.1em", marginBottom: 12 }}>MODULES</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {MODULES.map(m => {
            const on = config.modules.includes(m.id);
            return (
              <button key={m.id} onClick={() => setConfig(c => ({
                ...c,
                modules: on && c.modules.length > 1 ? c.modules.filter(x => x !== m.id) : on ? c.modules : [...c.modules, m.id]
              }))} style={{
                padding: "6px 14px", borderRadius: 6, fontFamily: mono, fontSize: 12, fontWeight: 600, cursor: "pointer",
                background: on ? m.color : "transparent",
                color: on ? C.bg : m.color,
                border: `1.5px solid ${m.color}`,
              }}>{m.icon} {m.label}</button>
            );
          })}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
        <div style={{ background: C.card, border: `1.5px solid ${C.border}`, borderRadius: 12, padding: "16px 20px" }}>
          <div style={{ fontFamily: mono, fontSize: 10, color: C.muted, letterSpacing: "0.1em", marginBottom: 10 }}>DIFFICULTY</div>
          {["Mixed", "Basic", "Intermediate", "Advanced"].map(d => (
            <button key={d} onClick={() => setConfig(c => ({ ...c, difficulty: d }))} style={{
              display: "block", width: "100%", textAlign: "left", padding: "6px 10px", marginBottom: 4, borderRadius: 5,
              background: config.difficulty === d ? C.accent + "20" : "transparent",
              border: `1px solid ${config.difficulty === d ? C.accent : C.border}`,
              fontFamily: mono, fontSize: 11, color: config.difficulty === d ? C.accent : C.muted, cursor: "pointer",
            }}>{d}</button>
          ))}
        </div>

        <div style={{ background: C.card, border: `1.5px solid ${C.border}`, borderRadius: 12, padding: "16px 20px" }}>
          <div style={{ fontFamily: mono, fontSize: 10, color: C.muted, letterSpacing: "0.1em", marginBottom: 10 }}>QUESTIONS</div>
          {[5, 8, 10, 15].map(n => (
            <button key={n} onClick={() => setConfig(c => ({ ...c, count: n }))} style={{
              display: "block", width: "100%", textAlign: "left", padding: "6px 10px", marginBottom: 4, borderRadius: 5,
              background: config.count === n ? C.accent + "20" : "transparent",
              border: `1px solid ${config.count === n ? C.accent : C.border}`,
              fontFamily: mono, fontSize: 11, color: config.count === n ? C.accent : C.muted, cursor: "pointer",
            }}>{n} questions</button>
          ))}
        </div>
      </div>

      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 16px", marginBottom: 20, fontFamily: mono, fontSize: 11, color: C.muted, lineHeight: 1.7 }}>
        <span style={{ color: C.warn }}>RULES: </span>
        No hints. No reveals. 90 seconds per question. Unanswered questions auto-submit. AI grades every answer. You get a letter grade at the end.
      </div>

      <Btn onClick={startInterview} disabled={!apiKey} style={{ padding: "10px 28px", fontSize: 13, width: "100%" }}>
        {apiKey ? "🎙 Start Interview" : "Add API key to start"}
      </Btn>
    </div>
  );

  if (phase === "active") {
    const q = questions[qIdx];
    const modColor = MODULES.find(m => m.id === q.mod)?.color || C.accent;
    const timerPct = (timeLeft / 90) * 100;
    const timerColor = timeLeft > 30 ? C.ok : timeLeft > 10 ? C.warn : C.err;

    return (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14, alignItems: "center" }}>
          <div style={{ fontFamily: mono, fontSize: 11, color: C.muted }}>🎙 Q{qIdx + 1} / {questions.length}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ fontFamily: mono, fontSize: 18, fontWeight: 700, color: timerColor }}>{timeLeft}s</div>
            {evaluating && <Spinner />}
          </div>
        </div>

        {/* Timer bar */}
        <div style={{ height: 4, background: C.border, borderRadius: 2, marginBottom: 20, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${timerPct}%`, background: timerColor, transition: "width 1s linear" }} />
        </div>

        <div style={{ background: C.card, border: `1.5px solid ${modColor}33`, borderRadius: 12, padding: "20px 22px", marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <Badge level={q.level} />
            <span style={{ fontFamily: mono, fontSize: 9, color: modColor, letterSpacing: "0.1em" }}>{q.mod.toUpperCase()}</span>
          </div>
          <div style={{ fontSize: 16, lineHeight: 1.65, color: C.text, fontWeight: 500 }}>{q.q}</div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <div style={{ fontFamily: mono, fontSize: 9, color: C.muted, letterSpacing: "0.12em", marginBottom: 6 }}>YOUR ANSWER</div>
          <TArea value={current} onChange={setCurrent} placeholder="Answer as you would in a real interview — no hints, no reveals..." rows={5} />
        </div>

        <Btn onClick={submitAnswer} disabled={evaluating} color={modColor} style={{ width: "100%", padding: "10px" }}>
          {evaluating ? "Evaluating..." : qIdx + 1 === questions.length ? "Submit Final Answer →" : "Submit Answer →"}
        </Btn>
      </div>
    );
  }

  if (phase === "debrief") {
    const strongCount = results.filter(r => r.score.score === "strong").length;
    const partialCount = results.filter(r => r.score.score === "partial").length;
    const weakCount = results.filter(r => r.score.score === "weak").length;
    const pct = Math.round((strongCount / results.length) * 100);
    const { grade, color: gradeColor, label } = letterGrade(pct);

    return (
      <div>
        {/* Header */}
        <div style={{ textAlign: "center", padding: "24px 0 20px", borderBottom: `1px solid ${C.border}`, marginBottom: 20 }}>
          <div style={{ fontSize: 52, fontWeight: 900, color: gradeColor, marginBottom: 4 }}>{grade}</div>
          <div style={{ fontFamily: mono, fontSize: 11, color: C.muted, letterSpacing: "0.1em", marginBottom: 14 }}>{label.toUpperCase()}</div>
          <div style={{ display: "flex", gap: 24, justifyContent: "center" }}>
            {[[C.ok, strongCount, "STRONG"], [C.warn, partialCount, "PARTIAL"], [C.err, weakCount, "WEAK"]].map(([col, val, lbl]) => (
              <div key={lbl} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: col }}>{val}</div>
                <div style={{ fontSize: 9, color: C.muted, fontFamily: mono, letterSpacing: "0.1em" }}>{lbl}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Per-question review */}
        <div style={{ fontFamily: mono, fontSize: 10, color: C.muted, letterSpacing: "0.12em", marginBottom: 12 }}>QUESTION REVIEW</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
          {results.map((r, i) => {
            const [scoreCol] = { strong: [C.ok], partial: [C.warn], weak: [C.err] }[r.score.score] || [C.err];
            const modColor = MODULES.find(m => m.id === r.mod)?.color || C.accent;
            return (
              <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden" }}>
                <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontFamily: mono, fontSize: 10, color: C.muted }}>Q{i + 1}</span>
                    <Badge level={r.level} />
                    <span style={{ fontFamily: mono, fontSize: 9, color: modColor }}>{r.mod.toUpperCase()}</span>
                  </div>
                  <ScorePill score={r.score.score} />
                </div>
                <div style={{ padding: "10px 14px" }}>
                  <div style={{ fontSize: 13, color: C.text, fontWeight: 500, marginBottom: 8, lineHeight: 1.5 }}>{r.q}</div>
                  {r.score.coaching && (
                    <div style={{ fontFamily: mono, fontSize: 11, color: C.muted, lineHeight: 1.6 }}>
                      <span style={{ color: C.accent }}>COACH: </span>{r.score.coaching}
                    </div>
                  )}
                  <details style={{ marginTop: 8 }}>
                    <summary style={{ fontFamily: mono, fontSize: 10, color: C.muted, cursor: "pointer", letterSpacing: "0.08em" }}>VIEW MODEL ANSWER</summary>
                    <div style={{ marginTop: 8, padding: "10px 12px", background: modColor + "0a", borderRadius: 6, fontSize: 12, lineHeight: 1.7, color: C.text }}>{r.a}</div>
                  </details>
                </div>
              </div>
            );
          })}
        </div>

        <Btn onClick={() => setPhase("config")} outline color={C.muted} style={{ width: "100%", padding: "10px" }}>
          ← Configure New Interview
        </Btn>
      </div>
    );
  }

  return null;
}


// ── SQL INTERVIEW PREP ────────────────────────────────────────────────────────

const SQL_LESSONS = [
  {
    id: "order_of_execution",
    label: "SQL Order of Execution",
    icon: "⬡",
    summary: "SQL does not execute in the order you write it. Understanding the logical execution order prevents common mistakes like using SELECT aliases in WHERE clauses.",
    steps: [
      {
        title: "The Logical Execution Order",
        explanation: "SQL processes clauses in this order, regardless of how you write the query: FROM and JOIN first (build the data set), then WHERE (filter rows), then GROUP BY (group them), then HAVING (filter groups), then SELECT (choose columns), then DISTINCT (remove duplicates), then ORDER BY (sort), then LIMIT or TOP (trim rows).",
        code: `-- You write it like this:
SELECT region, SUM(revenue) AS total
FROM orders
WHERE year = 2024
GROUP BY region
HAVING SUM(revenue) > 50000
ORDER BY total DESC
LIMIT 5;

-- But SQL executes it like this:
-- 1. FROM orders
-- 2. WHERE year = 2024
-- 3. GROUP BY region
-- 4. HAVING SUM(revenue) > 50000
-- 5. SELECT region, SUM(revenue) AS total
-- 6. ORDER BY total DESC
-- 7. LIMIT 5`
      },
      {
        title: "Why This Matters: Aliases",
        explanation: "Because SELECT runs after WHERE and GROUP BY, you cannot use a SELECT alias in those clauses. The alias does not exist yet when WHERE and GROUP BY run. You CAN use it in ORDER BY because ORDER BY runs after SELECT.",
        code: `-- This FAILS — WHERE runs before SELECT, alias does not exist yet:
SELECT SUM(revenue) AS total
FROM orders
WHERE total > 50000;  -- ERROR

-- Fix: repeat the expression in WHERE:
SELECT SUM(revenue) AS total
FROM orders
GROUP BY region
HAVING SUM(revenue) > 50000;  -- WORKS

-- This WORKS — ORDER BY runs after SELECT:
SELECT SUM(revenue) AS total
FROM orders
GROUP BY region
ORDER BY total DESC;  -- alias is fine here`
      },
    ]
  },
  {
    id: "where_vs_having",
    label: "WHERE vs HAVING",
    icon: "◈",
    summary: "WHERE and HAVING both filter data, but at different stages. Knowing which to use and why makes your queries faster and more accurate.",
    steps: [
      {
        title: "The Core Difference",
        explanation: "WHERE filters individual rows before grouping. You cannot use aggregate functions like SUM() or COUNT() in WHERE. HAVING filters groups after aggregation. You must use HAVING when your condition involves an aggregate. Think of it this way: WHERE says which rows to include, HAVING says which groups to keep.",
        code: `-- WHERE filters rows before GROUP BY:
SELECT region, SUM(revenue) AS total
FROM orders
WHERE order_date >= '2024-01-01'  -- row-level filter
GROUP BY region;

-- HAVING filters groups after GROUP BY:
SELECT region, SUM(revenue) AS total
FROM orders
GROUP BY region
HAVING SUM(revenue) > 100000;  -- group-level filter

-- Both together:
SELECT region, SUM(revenue) AS total
FROM orders
WHERE order_date >= '2024-01-01'  -- filter rows first
GROUP BY region
HAVING SUM(revenue) > 100000;    -- then filter groups`
      },
      {
        title: "Performance Tip",
        explanation: "Always filter with WHERE when possible instead of HAVING. WHERE reduces rows before GROUP BY processes them, which means less data to aggregate. HAVING can only filter after the full aggregation is done. If a condition does not require an aggregate function, put it in WHERE.",
        code: `-- Slow: HAVING filters after aggregating ALL rows
SELECT region, SUM(revenue)
FROM orders
GROUP BY region
HAVING region = 'West';  -- wrong place for this

-- Fast: WHERE filters BEFORE aggregation
SELECT region, SUM(revenue)
FROM orders
WHERE region = 'West'    -- reduces rows early
GROUP BY region;`
      },
    ]
  },
  {
    id: "pivot",
    label: "Rows to Columns (Pivot)",
    icon: "◉",
    summary: "Pivoting rotates row values into columns. SQL does not always have a built-in PIVOT function, but conditional aggregation works in every dialect.",
    steps: [
      {
        title: "Rows to Columns with CASE WHEN",
        explanation: "The standard approach is conditional aggregation: use a CASE WHEN inside an aggregate function to create one column per category. This works in MySQL, PostgreSQL, BigQuery, Snowflake, and SQL Server — no special syntax required.",
        code: `-- Source data (rows):
-- product | month | revenue
-- Widget  | Jan   | 1000
-- Widget  | Feb   | 1200
-- Gadget  | Jan   | 800

-- Pivot to columns:
SELECT
  product,
  SUM(CASE WHEN month = 'Jan' THEN revenue END) AS Jan,
  SUM(CASE WHEN month = 'Feb' THEN revenue END) AS Feb,
  SUM(CASE WHEN month = 'Mar' THEN revenue END) AS Mar
FROM sales
GROUP BY product;

-- Result:
-- product | Jan  | Feb  | Mar
-- Widget  | 1000 | 1200 | NULL
-- Gadget  | 800  | NULL | NULL`
      },
      {
        title: "Columns to Rows (Unpivot)",
        explanation: "To go the other direction — columns back to rows — use UNION ALL. Each SELECT block pulls one column and labels it as a row. This is the cross-dialect approach to unpivoting.",
        code: `-- Source data (columns):
-- product | jan_rev | feb_rev | mar_rev

-- Unpivot to rows:
SELECT product, 'Jan' AS month, jan_rev AS revenue
FROM sales
UNION ALL
SELECT product, 'Feb', feb_rev
FROM sales
UNION ALL
SELECT product, 'Mar', mar_rev
FROM sales
ORDER BY product, month;`
      },
    ]
  },
  {
    id: "self_join",
    label: "Self Join",
    icon: "◆",
    summary: "A self join lets a table reference itself. It is essential when rows in a table point to other rows in the same table, like employees and managers.",
    steps: [
      {
        title: "The Pattern",
        explanation: "To self join, give the same table two different aliases and join it to itself on the relationship between rows. The most common use case is an org chart: employees and managers stored in the same table.",
        code: `-- Table: employees (employee_id, name, manager_id)

-- Find each employee and their manager's name:
SELECT
  e.name AS employee,
  m.name AS manager
FROM employees e
LEFT JOIN employees m
  ON e.manager_id = m.employee_id;

-- LEFT JOIN keeps employees with no manager (like the CEO)
-- INNER JOIN would drop them`
      },
      {
        title: "Finding Pairs",
        explanation: "Self joins also find relationships between rows of the same type — like employees in the same department. Use a.id < b.id to avoid duplicate pairs and self-matching.",
        code: `-- Find all employee pairs in the same department:
SELECT
  a.name AS emp1,
  b.name AS emp2,
  a.dept
FROM employees a
JOIN employees b
  ON a.dept = b.dept
  AND a.id < b.id;  -- prevents (Bob,Alice) AND (Alice,Bob)
                   -- and prevents (Alice,Alice)`
      },
    ]
  },
  {
    id: "joins",
    label: "JOIN Types",
    icon: "⬡",
    summary: "JOINs combine rows from multiple tables. Each type handles missing matches differently. Understanding the difference prevents data loss and row multiplication.",
    steps: [
      {
        title: "The Four Main JOIN Types",
        explanation: "INNER JOIN returns only rows with matches on both sides. LEFT JOIN returns all left rows plus matches from the right (NULL where no match). RIGHT JOIN is the mirror of LEFT. FULL OUTER JOIN returns everything from both sides with NULLs where no match exists. In practice, LEFT JOIN is by far the most common.",
        code: `-- INNER JOIN: only matched rows
SELECT o.order_id, c.name
FROM orders o
INNER JOIN customers c ON o.customer_id = c.id;

-- LEFT JOIN: all orders, even without a customer match
SELECT o.order_id, c.name
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id;
-- c.name is NULL where no customer found

-- FULL OUTER JOIN: all orders AND all customers
SELECT o.order_id, c.name
FROM orders o
FULL OUTER JOIN customers c ON o.customer_id = c.id;`
      },
      {
        title: "Row Multiplication Warning",
        explanation: "If your join produces more rows than you started with, the table you joined to has duplicate values in the join column. Always check for this. Diagnose with a COUNT, then deduplicate before joining.",
        code: `-- Diagnose duplicates in customers table:
SELECT customer_id, COUNT(*)
FROM customers
GROUP BY customer_id
HAVING COUNT(*) > 1;

-- Fix: deduplicate first with ROW_NUMBER
WITH unique_customers AS (
  SELECT *,
    ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY updated_at DESC) AS rn
  FROM customers
)
SELECT o.order_id, c.name
FROM orders o
JOIN unique_customers c
  ON o.customer_id = c.customer_id
  AND c.rn = 1;`
      },
    ]
  },
  {
    id: "count_variants",
    label: "COUNT Variants",
    icon: "◈",
    summary: "COUNT has several forms that behave differently around NULLs. Using the wrong one gives you a silently wrong number.",
    steps: [
      {
        title: "COUNT(*) vs COUNT(column)",
        explanation: "COUNT(*) counts every row including those with NULLs. COUNT(column) counts only rows where that column is not NULL. COUNT(1) and COUNT(0) are identical to COUNT(*) — the literal value is never NULL so every row counts.",
        code: `-- Table: users (user_id, email)
-- 100 rows total, 20 have NULL email

SELECT
  COUNT(*)      AS total_rows,       -- 100
  COUNT(1)      AS also_total,        -- 100
  COUNT(email)  AS non_null_emails,   -- 80
  COUNT(*) - COUNT(email) AS null_emails  -- 20
FROM users;

-- COUNT(DISTINCT column) counts unique non-null values:
SELECT COUNT(DISTINCT region) AS unique_regions
FROM orders;`
      },
    ]
  },
  {
    id: "aggregations",
    label: "SQL Aggregations",
    icon: "◉",
    summary: "Aggregations collapse many rows into summary values. Mastering them plus window functions covers most analytics work.",
    steps: [
      {
        title: "The Five Core Aggregates",
        explanation: "COUNT, SUM, AVG, MIN, and MAX are the foundation. All of them ignore NULL values except COUNT(*). They all require GROUP BY when combined with non-aggregated columns in SELECT.",
        code: `SELECT
  region,
  COUNT(*)           AS order_count,
  SUM(revenue)       AS total_revenue,
  AVG(revenue)       AS avg_order_value,
  MIN(revenue)       AS smallest_order,
  MAX(revenue)       AS largest_order
FROM orders
GROUP BY region
ORDER BY total_revenue DESC;`
      },
      {
        title: "Percentage of Total with Window Functions",
        explanation: "A common pattern: show each group value AND its percentage of the overall total in one query. Use a window function nested inside an aggregate to get the grand total without a subquery.",
        code: `SELECT
  region,
  SUM(revenue) AS region_revenue,
  ROUND(
    SUM(revenue) * 100.0 / SUM(SUM(revenue)) OVER (),
    2
  ) AS pct_of_total
FROM orders
GROUP BY region
ORDER BY region_revenue DESC;

-- SUM(SUM(revenue)) OVER () is the grand total
-- The inner SUM groups by region
-- The outer SUM() OVER () removes the partition, summing all groups`
      },
    ]
  },
  {
    id: "duplicates",
    label: "Finding and Removing Duplicates",
    icon: "◆",
    summary: "Duplicate rows are one of the most common data quality issues. SQL gives you precise tools to find them, investigate them, and remove only what you want.",
    steps: [
      {
        title: "Finding Duplicates",
        explanation: "Use GROUP BY with HAVING COUNT(*) > 1 to find which values appear more than once. To see the full rows of duplicates, use a subquery or IN clause.",
        code: `-- Find which emails are duplicated:
SELECT email, COUNT(*) AS occurrences
FROM customers
GROUP BY email
HAVING COUNT(*) > 1
ORDER BY occurrences DESC;

-- See all columns of duplicate rows:
SELECT *
FROM customers
WHERE email IN (
  SELECT email
  FROM customers
  GROUP BY email
  HAVING COUNT(*) > 1
);`
      },
      {
        title: "Removing Duplicates with ROW_NUMBER()",
        explanation: "ROW_NUMBER() is the standard tool for deduplication. Partition by the duplicate key, order by whichever row you want to keep (lowest id, most recent date, etc.), then delete or filter where rn > 1.",
        code: `-- Keep the most recent duplicate per customer_id:
WITH ranked AS (
  SELECT *,
    ROW_NUMBER() OVER (
      PARTITION BY customer_id
      ORDER BY updated_at DESC  -- most recent = rn 1
    ) AS rn
  FROM customers
)
-- First: SELECT to verify what you will delete
SELECT * FROM ranked WHERE rn > 1;

-- Then: DELETE
DELETE FROM customers
WHERE id IN (
  SELECT id FROM ranked WHERE rn > 1
);
-- Always SELECT before DELETE`
      },
    ]
  },
  {
    id: "window_rank",
    label: "RANK, DENSE_RANK, ROW_NUMBER",
    icon: "⬡",
    summary: "These three window functions all assign numbers to rows, but handle ties differently. Picking the wrong one is a common interview mistake.",
    steps: [
      {
        title: "How Each One Handles Ties",
        explanation: "Given scores of 100, 100, 90: ROW_NUMBER gives 1, 2, 3 — unique numbers, ties broken arbitrarily. RANK gives 1, 1, 3 — ties share the same rank, next rank skips. DENSE_RANK gives 1, 1, 2 — ties share the same rank, no skipping.",
        code: `SELECT
  name,
  score,
  ROW_NUMBER()   OVER (ORDER BY score DESC) AS row_num,
  RANK()         OVER (ORDER BY score DESC) AS rnk,
  DENSE_RANK()   OVER (ORDER BY score DESC) AS dense_rnk
FROM scores;

-- Results:
-- name  | score | row_num | rnk | dense_rnk
-- Alice | 100   | 1       | 1   | 1
-- Bob   | 100   | 2       | 1   | 1
-- Carol | 90    | 3       | 3   | 2`
      },
      {
        title: "Top-1 Per Group Pattern",
        explanation: "The most tested use of ROW_NUMBER: return exactly one row per group. Partition by the group key, order by what defines the winner, filter where rn = 1. Use ROW_NUMBER here, not RANK, because RANK can return multiple rows when there are ties.",
        code: `-- Return the most recent order per customer:
WITH ranked AS (
  SELECT *,
    ROW_NUMBER() OVER (
      PARTITION BY customer_id
      ORDER BY order_date DESC
    ) AS rn
  FROM orders
)
SELECT order_id, customer_id, order_date, amount
FROM ranked
WHERE rn = 1;

-- ROW_NUMBER guarantees exactly one row per customer
-- RANK would return multiple rows if two orders share the same date`
      },
    ]
  },
  {
    id: "first_last_value",
    label: "FIRST_VALUE and LAST_VALUE",
    icon: "◈",
    summary: "FIRST_VALUE and LAST_VALUE retrieve values from the first or last row in a window. LAST_VALUE has a critical gotcha that trips up most analysts.",
    steps: [
      {
        title: "FIRST_VALUE",
        explanation: "FIRST_VALUE returns the value from the first row in the window, based on your ORDER BY. It is useful for comparing each row to a baseline — like the first sale of the year or the founding salary in a department.",
        code: `-- Show each employee salary vs the first person hired in their dept:
SELECT
  name,
  dept,
  salary,
  hire_date,
  FIRST_VALUE(salary) OVER (
    PARTITION BY dept
    ORDER BY hire_date
  ) AS first_hire_salary
FROM employees;`
      },
      {
        title: "LAST_VALUE — The Gotcha",
        explanation: "By default, LAST_VALUE only looks up to the current row, not the end of the partition. This means it returns the current row value instead of the actual last. You must add an explicit frame to fix it.",
        code: `-- WRONG: returns current row salary, not the last hired salary
SELECT
  name,
  LAST_VALUE(salary) OVER (
    PARTITION BY dept
    ORDER BY hire_date
  ) AS wrong_result;

-- CORRECT: extend the frame to end of partition
SELECT
  name,
  LAST_VALUE(salary) OVER (
    PARTITION BY dept
    ORDER BY hire_date
    ROWS BETWEEN UNBOUNDED PRECEDING
             AND UNBOUNDED FOLLOWING  -- this is the fix
  ) AS last_hire_salary
FROM employees;`
      },
    ]
  },
  {
    id: "rollup_cube",
    label: "ROLLUP, CUBE, GROUPING SETS",
    icon: "◉",
    summary: "These extensions to GROUP BY generate subtotals and grand totals automatically, replacing what used to require multiple UNION ALL queries.",
    steps: [
      {
        title: "ROLLUP — Hierarchical Subtotals",
        explanation: "ROLLUP generates subtotals along a hierarchy. For GROUP BY ROLLUP(region, product), you get one row per region-product combination, one subtotal per region, and one grand total row. NULL in the result marks subtotal and grand total rows.",
        code: `SELECT
  region,
  product,
  SUM(revenue) AS total
FROM orders
GROUP BY ROLLUP(region, product)
ORDER BY region, product;

-- Results include:
-- West | Widget | 5000   (detail row)
-- West | Gadget | 3000   (detail row)
-- West | NULL   | 8000   (region subtotal)
-- NULL | NULL   | 15000  (grand total)

-- Use GROUPING(region) = 1 to identify rollup NULLs vs real NULLs`
      },
      {
        title: "CUBE and GROUPING SETS",
        explanation: "CUBE generates every possible combination of groupings. GROUPING SETS lets you specify exactly which groupings you want. Use CUBE for multidimensional dashboards, GROUPING SETS when you need a specific custom set of summaries.",
        code: `-- CUBE: all combinations of region and product
GROUP BY CUBE(region, product)
-- Gives: (region,product), (region), (product), ()

-- GROUPING SETS: only the combinations you specify
GROUP BY GROUPING SETS(
  (region, product),  -- detail
  (region),           -- region subtotal only
  ()                  -- grand total only
)
-- Skips the (product) subtotal that CUBE would include`
      },
    ]
  },
  {
    id: "slowly_changing",
    label: "Slowly Changing Dimensions",
    icon: "◆",
    summary: "SCDs are how data warehouses track changes to dimension data over time. Type 2 is the standard and the most important to understand.",
    steps: [
      {
        title: "Type 1, 2, and 3",
        explanation: "Type 1 overwrites the old value — simple, but history is lost. Type 2 adds a new row for each change and keeps the old row with an end date — full history preserved, most common in analytics. Type 3 adds a column for the previous value — keeps one prior version only.",
        code: `-- Type 2 SCD table structure:
-- customer_id | region | start_date | end_date   | is_current
-- 101         | West   | 2022-01-01 | 2023-06-14 | FALSE
-- 101         | East   | 2023-06-15 | NULL       | TRUE

-- Query: what was this customer's region on a specific date?
SELECT region
FROM customer_dim
WHERE customer_id = 101
  AND start_date <= '2023-01-01'
  AND (end_date > '2023-01-01' OR end_date IS NULL);
-- Returns: West (they had not moved yet)`
      },
    ]
  },
  {
    id: "merge",
    label: "SQL MERGE Statement",
    icon: "⬡",
    summary: "MERGE handles INSERT, UPDATE, and DELETE in one statement based on whether rows match between a source and target table.",
    steps: [
      {
        title: "How MERGE Works",
        explanation: "MERGE compares a source table to a target table row by row. When a row matches, you can UPDATE it. When it does not match in the target, you INSERT it. Some dialects also allow DELETE on match. This replaces the common pattern of separate UPDATE and INSERT statements.",
        code: `-- Sync new_customers into customers table:
MERGE customers AS target
USING new_customers AS source
  ON target.customer_id = source.customer_id

WHEN MATCHED THEN
  UPDATE SET
    target.region = source.region,
    target.updated_at = GETDATE()

WHEN NOT MATCHED BY TARGET THEN
  INSERT (customer_id, name, region, created_at)
  VALUES (source.customer_id, source.name, source.region, GETDATE());

-- Note: PostgreSQL uses INSERT ... ON CONFLICT instead of MERGE
-- Always test the join condition with SELECT before running MERGE`
      },
    ]
  },
  {
    id: "views_materialized",
    label: "Views vs Materialized Views",
    icon: "◈",
    summary: "Both are saved queries, but one stores the results and one does not. The difference matters for performance and freshness.",
    steps: [
      {
        title: "Regular Views",
        explanation: "A regular view is a saved query — it runs fresh every time you query it. No data is stored. The view is always current but adds the cost of running the underlying query on each access. Best for simplicity and when data must always be real-time.",
        code: `-- Create a view:
CREATE VIEW regional_summary AS
SELECT region, SUM(revenue) AS total
FROM orders
GROUP BY region;

-- Query it like a table (runs the query fresh each time):
SELECT * FROM regional_summary WHERE region = 'West';`
      },
      {
        title: "Materialized Views",
        explanation: "A materialized view stores the query result physically on disk. Querying it is fast because the data is pre-computed. The tradeoff is staleness — you must refresh it manually or on a schedule. Use for expensive aggregations that run frequently and can tolerate being slightly behind.",
        code: `-- Create a materialized view (Snowflake / PostgreSQL syntax):
CREATE MATERIALIZED VIEW regional_summary_mat AS
SELECT region, SUM(revenue) AS total
FROM orders
GROUP BY region;

-- Refresh when source data changes:
REFRESH MATERIALIZED VIEW regional_summary_mat;

-- Use when:
-- The query joins many large tables
-- It is queried dozens of times per hour
-- Hour-old data is acceptable for the report`
      },
    ]
  },
  {
    id: "advanced",
    label: "Advanced Patterns",
    icon: "◉",
    summary: "The patterns that separate a good SQL writer from a strong analyst. Running totals, month-over-month growth, rolling windows, and Nth value queries.",
    steps: [
      {
        title: "Running Total",
        explanation: "A running total accumulates a value as you move down ordered rows. Always use ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW explicitly — without it, duplicate dates can produce unexpected results.",
        code: `SELECT
  order_date,
  amount,
  SUM(amount) OVER (
    ORDER BY order_date
    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
  ) AS running_total
FROM orders
ORDER BY order_date;`
      },
      {
        title: "Month-over-Month Growth",
        explanation: "Use LAG() to pull the prior month value alongside the current month, then calculate the percentage change. NULLIF prevents divide-by-zero when the prior month is zero.",
        code: `WITH monthly AS (
  SELECT
    DATE_TRUNC('month', sale_date) AS month,
    SUM(revenue) AS revenue
  FROM sales
  GROUP BY 1
)
SELECT
  month,
  revenue,
  LAG(revenue) OVER (ORDER BY month) AS prev_month,
  ROUND(
    (revenue - LAG(revenue) OVER (ORDER BY month)) * 100.0
    / NULLIF(LAG(revenue) OVER (ORDER BY month), 0),
  2) AS mom_pct_change
FROM monthly
ORDER BY month;`
      },
      {
        title: "Rolling 7-Day Window",
        explanation: "Count events within a rolling window per user or entity. This pattern is used in fraud detection, engagement scoring, and churn analysis.",
        code: `-- Flag customers with 3+ purchases in any 7-day window:
WITH windowed AS (
  SELECT
    customer_id,
    transaction_date,
    COUNT(*) OVER (
      PARTITION BY customer_id
      ORDER BY transaction_date
      RANGE BETWEEN INTERVAL '6' DAY PRECEDING
               AND CURRENT ROW
    ) AS purchases_in_7_days
  FROM transactions
)
SELECT DISTINCT customer_id
FROM windowed
WHERE purchases_in_7_days >= 3;`
      },
    ]
  },
];

const SQL_PREP_COLOR = "#38bdf8";

function SQLPrepMode() {
  const [view, setView] = useState("topics");
  const [activeTopic, setActiveTopic] = useState(null);
  const [stepIdx, setStepIdx] = useState(0);

  const openTopic = (topic) => {
    setActiveTopic(topic);
    setStepIdx(0);
    setView("lesson");
  };

  const currentStep = activeTopic ? activeTopic.steps[stepIdx] : null;
  const isLast = activeTopic ? stepIdx === activeTopic.steps.length - 1 : false;

  if (view === "topics") return (
    <div>
      <div style={{ fontFamily: mono, fontSize: 10, color: SQL_PREP_COLOR, letterSpacing: "0.12em", marginBottom: 6 }}>SQL INTERVIEW PREP</div>
      <div style={{ fontSize: 13, color: C.muted, marginBottom: 20, lineHeight: 1.6 }}>
        {SQL_LESSONS.length} topics. Each one walks you through the concept and shows worked examples. No grading.
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {SQL_LESSONS.map(t => (
          <button key={t.id} onClick={() => openTopic(t)} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: C.card, border: "1.5px solid " + C.border, borderRadius: 10,
            padding: "14px 18px", cursor: "pointer", textAlign: "left", width: "100%",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 18 }}>{t.icon}</span>
              <div>
                <div style={{ fontSize: 13, color: C.text, fontWeight: 600, marginBottom: 3 }}>{t.label}</div>
                <div style={{ fontFamily: mono, fontSize: 10, color: C.muted, lineHeight: 1.5 }}>{t.summary}</div>
              </div>
            </div>
            <span style={{ fontFamily: mono, fontSize: 16, color: SQL_PREP_COLOR, flexShrink: 0, marginLeft: 12 }}>→</span>
          </button>
        ))}
      </div>
    </div>
  );

  if (view === "lesson" && activeTopic && currentStep) return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <button onClick={() => setView("topics")} style={{ background: "none", border: "none", fontFamily: mono, fontSize: 11, color: C.muted, cursor: "pointer" }}>← Topics</button>
        <div style={{ fontFamily: mono, fontSize: 11, color: C.muted }}>{stepIdx + 1} / {activeTopic.steps.length}</div>
      </div>

      <div style={{ height: 3, background: C.border, borderRadius: 2, marginBottom: 20 }}>
        <div style={{ height: "100%", width: ((stepIdx + 1) / activeTopic.steps.length * 100) + "%", background: SQL_PREP_COLOR, borderRadius: 2, transition: "width 0.3s" }} />
      </div>

      <div style={{ fontFamily: mono, fontSize: 9, color: SQL_PREP_COLOR, letterSpacing: "0.12em", marginBottom: 8 }}>{activeTopic.label.toUpperCase()}</div>
      <div style={{ fontSize: 17, fontWeight: 700, color: C.text, marginBottom: 16, lineHeight: 1.4 }}>{currentStep.title}</div>

      <div style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 10, padding: "16px 18px", marginBottom: 14, fontSize: 13, color: C.muted, lineHeight: 1.8 }}>
        {currentStep.explanation}
      </div>

      <div style={{ background: "#0d1117", border: "1px solid " + SQL_PREP_COLOR + "33", borderRadius: 10, padding: "16px 18px", marginBottom: 20 }}>
        <div style={{ fontFamily: mono, fontSize: 9, color: SQL_PREP_COLOR, letterSpacing: "0.1em", marginBottom: 10 }}>EXAMPLE</div>
        <pre style={{ fontFamily: mono, fontSize: 12, color: "#c9d1d9", lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{currentStep.code}</pre>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        {stepIdx > 0 && (
          <button onClick={() => setStepIdx(stepIdx - 1)} style={{
            flex: 1, padding: "10px", background: "transparent", color: C.muted,
            border: "1px solid " + C.border, borderRadius: 8, fontFamily: mono, fontSize: 12, cursor: "pointer",
          }}>← Previous</button>
        )}
        {!isLast ? (
          <button onClick={() => setStepIdx(stepIdx + 1)} style={{
            flex: 1, padding: "10px", background: SQL_PREP_COLOR, color: C.bg,
            border: "none", borderRadius: 8, fontFamily: mono, fontSize: 12, fontWeight: 700, cursor: "pointer",
          }}>Next →</button>
        ) : (
          <button onClick={() => setView("topics")} style={{
            flex: 1, padding: "10px", background: SQL_PREP_COLOR, color: C.bg,
            border: "none", borderRadius: 8, fontFamily: mono, fontSize: 12, fontWeight: 700, cursor: "pointer",
          }}>Done — Back to Topics</button>
        )}
      </div>
    </div>
  );

  return null;
}


// ── SUPABASE CONFIG ───────────────────────────────────────────────────────────

const SUPABASE_URL = "https://ieifyvmweywzplmwqtns.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImllaWZ5dm13ZXl3enBsbXdxdG5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1MDUzMjAsImV4cCI6MjA5MTA4MTMyMH0.eWdSzl1GzB4DNys1KbwoHKqdH56RYS04yanFLQ7PjNQ";

async function saveSessionToSupabase(sessionData) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/analytics_sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        "Prefer": "return=minimal",
      },
      body: JSON.stringify(sessionData),
    });
    return res.ok;
  } catch (e) {
    console.error("Supabase save error:", e);
    return false;
  }
}

async function loadSessionsFromSupabase() {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/analytics_sessions?select=*&order=created_at.desc&limit=30`,
      {
        headers: {
          "apikey": SUPABASE_ANON_KEY,
          "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );
    if (!res.ok) return [];
    return await res.json();
  } catch (e) {
    return [];
  }
}

// ── ANALYTICS COACH ───────────────────────────────────────────────────────────

const COACH_ACCENT = "#e879f9";
const COACH_BG = "#1a0a1f";

const FOCUS_OPTIONS = [
  { value: "auto",         label: "Auto-calibrate (recommended)" },
  { value: "business",     label: "Business thinking focus" },
  { value: "sql",          label: "SQL technical focus" },
  { value: "stakeholder",  label: "Stakeholder simulation focus" },
  { value: "communication",label: "Communication focus" },
  { value: "interview",    label: "Mock interview mode" },
  { value: "linkedin",     label: "LinkedIn content creation" },
];

const FOCUS_INSTRUCTIONS = {
  auto:          "Run the full standard 4-module session with auto-calibrated difficulty.",
  business:      "Focus heavily on business thinking today. Spend 25 minutes on progressively harder business scenarios. Include a brief SQL warmup but skip the full stakeholder simulation.",
  sql:           "Focus heavily on SQL today. Spend 25 minutes on progressively harder SQL challenges including complex CTEs and window functions. Include a brief business warmup.",
  stakeholder:   "Focus on stakeholder simulation today. Run 3 different stakeholder scenarios back to back with different executive personalities.",
  communication: "Focus on communication today. Cover executive emails, slide headlines, board memos, and one-page briefs using the SCR framework.",
  interview:     "Run a full mock analytics interview. Ask typical senior analytics interview questions across business thinking, SQL, and communication competencies. Give hiring-manager-level feedback after each answer. Be direct and challenging.",
  linkedin:      "Help Jake create a LinkedIn post about his analytics learning journey. Ask clarifying questions about tone, focus, and key skills to highlight. Remember: absolutely no em-dashes or hyphens anywhere in the final post.",
};

const COACH_SYSTEM = `You are an expert AI Analytics Training Partner conducting a structured daily practice session for Jake.

Jake's current skill levels (out of 10):
- Business Thinking: 9.5 — Advanced. Identify missing data, build measurement frameworks, handle conflicting data
- SQL Technical: 9.4 — Advanced. Complex multi-CTEs, window functions (RANK, LAG, ROW_NUMBER), CASE statements, conditional aggregations
- Stakeholder Communication: 9.0 — Advanced. Board-level presentations, hostile executives, panel simulations, coaching junior analysts
- Executive Communication: 8.5 — Advanced. Board memos, SCR framework, one-page briefs, slide headlines

Key facts about Jake:
- 7+ structured training sessions completed
- Core principle: "Locate before you hypothesize" — always identify WHERE in customer journey a problem occurs first
- Natural strength: stakeholder communication, making adversarial stakeholders feel like collaborators
- Writing preference: NO em-dashes or hyphens in any written deliverables
- SQL mastered: SELECT, GROUP BY, JOINs, LEFT JOINs, CTEs, window functions, CASE statements, conditional aggregations

Session rules:
- Push hard — Jake is advanced, do not simplify or over-scaffold
- Give scored feedback (X/10) after each answer with specific actionable coaching
- Build progressively within each module
- If Jake says something is too hard, scaffold ONE level then push again immediately
- Never give away the full answer before Jake attempts it
- End session with full scorecard and 3 key takeaways
- At the very end of the session output scores on separate lines EXACTLY like this (no other text on these lines):
  SCORE_BT:X.X
  SCORE_SQL:X.X
  SCORE_SH:X.X
  SCORE_COM:X.X
  (only include modules actually covered in the session)

Start with a brief warm greeting, today's difficulty calibration, then immediately begin with a warmup question. Keep responses concise and direct.`;

function AnalyticsCoach({ apiKey }) {
  const [phase, setPhase] = useState("home");
  const [focus, setFocus] = useState("auto");
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [inputMode, setInputMode] = useState("text");
  const [showTables, setShowTables] = useState(false);
  const [sessionTables, setSessionTables] = useState([]);
  const [scores, setScores] = useState(() => {
    const saved = localStorage.getItem("coach_scores");
    return saved ? JSON.parse(saved) : { bt: 9.5, sql: 9.4, sh: 9.0, com: 8.5 };
  });
  const [sessionCount, setSessionCount] = useState(() => parseInt(localStorage.getItem("coach_sessions") || "7"));
  const [streak, setStreak] = useState(() => parseInt(localStorage.getItem("coach_streak") || "7"));
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [newScores, setNewScores] = useState({});
  const [savingToDb, setSavingToDb] = useState(false);
  const [dbSaved, setDbSaved] = useState(false);
  const msgsEndRef = React.useRef(null);

  useEffect(() => {
    if (msgsEndRef.current) msgsEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [msgs, loading]);

  const saveScoresLocally = (s, count, str) => {
    localStorage.setItem("coach_scores", JSON.stringify(s));
    localStorage.setItem("coach_sessions", String(count));
    localStorage.setItem("coach_streak", String(str));
  };

  const overall = ((scores.bt + scores.sql + scores.sh + scores.com) / 4).toFixed(1);

  const callClaude = async (messages) => {
    if (!apiKey) { setError("Add your Anthropic API key above to use Analytics Coach."); return null; }
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: "claude-opus-4-5",
        max_tokens: 1000,
        system: COACH_SYSTEM,
        messages,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `API error ${res.status}`);
    }
    const data = await res.json();
    return data.content?.[0]?.text || "";
  };

  const parseScores = (text) => {
    const found = {};
    const pat = /SCORE_(BT|SQL|SH|COM):([\d.]+)/g;
    let m;
    while ((m = pat.exec(text)) !== null) {
      found[m[1].toLowerCase()] = parseFloat(m[2]);
    }
    return found;
  };

  const detectTables = (text) => {
    const tables = [];
    // Match patterns like: table_name (col1, col2, col3) or table_name: col1 | col2
    const blockPattern = /```[\s\S]*?```/g;
    const blocks = text.match(blockPattern) || [];
    blocks.forEach(block => {
      const lines = block.replace(/```/g, "").trim().split("\n");
      lines.forEach(line => {
        const tableMatch = line.match(/^(\w+)\s*[|:]\s*(.+)/);
        if (tableMatch) {
          const name = tableMatch[1].trim();
          const cols = tableMatch[2].split(/[|,]/).map(c => c.trim()).filter(Boolean);
          if (cols.length > 0 && !["SELECT", "FROM", "WHERE", "JOIN", "WITH"].includes(name.toUpperCase())) {
            tables.push({ name, cols });
          }
        }
      });
    });
    // Also match inline patterns like "table called orders with columns: order_id, customer_id, revenue"
    const inlinePattern = /(?:table\s+(?:called\s+)?|`?)(\w+)`?\s+(?:with\s+columns?:|columns?:|\()\s*([\w,\s]+)/gi;
    let m2;
    while ((m2 = inlinePattern.exec(text)) !== null) {
      const name = m2[1].trim();
      const cols = m2[2].split(",").map(c => c.trim()).filter(Boolean);
      if (cols.length > 0) tables.push({ name, cols });
    }
    if (tables.length > 0) {
      setSessionTables(prev => {
        const existing = prev.map(t => t.name);
        const newTables = tables.filter(t => !existing.includes(t.name));
        return newTables.length > 0 ? [...prev, ...newTables] : prev;
      });
    }
  };

  const startSession = async () => {
    setError("");
    setMsgs([]);
    setNewScores({});
    setDbSaved(false);
    setSessionTables([]);
    setInputMode("text");
    setShowTables(false);
    setPhase("session");
    const initMsg = { role: "user", content: "Start my session now. " + (FOCUS_INSTRUCTIONS[focus] || FOCUS_INSTRUCTIONS.auto) };
    const conversation = [initMsg];
    setLoading(true);
    try {
      const reply = await callClaude(conversation);
      const clean = reply.replace(/SCORE_(BT|SQL|SH|COM):[\d.]+/g, "").trim();
      const found = parseScores(reply);
      setMsgs([{ role: "assistant", content: clean }]);
      detectTables(clean);
      if (Object.keys(found).length > 0) setNewScores(found);
    } catch (e) {
      setError(e.message);
      setPhase("home");
    }
    setLoading(false);
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input.trim() };
    setInput("");
    const history = [...msgs, { role: "user", content: userMsg.content }];
    setMsgs(history);
    setLoading(true);
    setError("");

    const apiMsgs = [
      { role: "user", content: "Start my session now. " + (FOCUS_INSTRUCTIONS[focus] || FOCUS_INSTRUCTIONS.auto) },
      ...msgs.map(m => ({ role: m.role, content: m.content })),
      userMsg,
    ];

    try {
      const reply = await callClaude(apiMsgs);
      const clean = reply.replace(/SCORE_(BT|SQL|SH|COM):[\d.]+/g, "").trim();
      const found = parseScores(reply);
      setMsgs(prev => [...prev, { role: "assistant", content: clean }]);
      detectTables(clean);
      if (Object.keys(found).length > 0) {
        setNewScores(found);
        setTimeout(() => finishSession(found), 800);
      }
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  const finishSession = async (ns) => {
    const finalScores = { ...scores, ...ns };
    const newCount = sessionCount + 1;
    const today = new Date().toDateString();
    const lastDate = localStorage.getItem("coach_last_date");
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const newStreak = lastDate === yesterday ? streak + 1 : lastDate === today ? streak : 1;
    localStorage.setItem("coach_last_date", today);
    setScores(finalScores);
    setSessionCount(newCount);
    setStreak(newStreak);
    saveScoresLocally(finalScores, newCount, newStreak);

    setSavingToDb(true);
    const saved = await saveSessionToSupabase({
      session_number: newCount,
      score_bt: finalScores.bt,
      score_sql: finalScores.sql,
      score_sh: finalScores.sh,
      score_com: finalScores.com,
      overall_score: parseFloat(((finalScores.bt + finalScores.sql + finalScores.sh + finalScores.com) / 4).toFixed(1)),
      streak: newStreak,
    });
    setSavingToDb(false);
    setDbSaved(saved);
  };

  const endSessionManually = async () => {
    if (Object.keys(newScores).length > 0) {
      await finishSession(newScores);
      setPhase("results");
      return;
    }
    const apiMsgs = [
      { role: "user", content: "Start my session now. " + (FOCUS_INSTRUCTIONS[focus] || FOCUS_INSTRUCTIONS.auto) },
      ...msgs.map(m => ({ role: m.role, content: m.content })),
      { role: "user", content: "Please end the session now. Output my scores using SCORE_BT, SCORE_SQL, SCORE_SH, SCORE_COM format, then give a brief summary." },
    ];
    setLoading(true);
    try {
      const reply = await callClaude(apiMsgs);
      const found = parseScores(reply);
      const clean = reply.replace(/SCORE_(BT|SQL|SH|COM):[\d.]+/g, "").trim();
      setMsgs(prev => [...prev, { role: "assistant", content: clean }]);
      if (Object.keys(found).length > 0) {
        await finishSession(found);
        setNewScores(found);
      }
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
    setPhase("results");
  };

  const loadHistory = async () => {
    setHistoryLoading(true);
    const data = await loadSessionsFromSupabase();
    setHistory(data);
    setHistoryLoading(false);
    setShowHistory(true);
  };

  const scoreColor = (v) => v >= 9 ? C.ok : v >= 7.5 ? COACH_ACCENT : v >= 6 ? C.warn : C.err;
  const scoreBarColor = (k) => ({ bt: "#1D9E75", sql: "#378ADD", sh: "#7F77DD", com: "#D85A30" }[k]);
  const scoreName = (k) => ({ bt: "Business thinking", sql: "SQL technical", sh: "Stakeholder", com: "Communication" }[k]);

  // HOME
  if (phase === "home") return (
    <div>
      {/* Score dashboard */}
      <div style={{ background: COACH_BG, border: `1.5px solid ${COACH_ACCENT}22`, borderRadius: 12, padding: "18px 20px", marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontFamily: mono, fontSize: 10, color: COACH_ACCENT, letterSpacing: "0.12em" }}>ANALYTICS COACH — PROGRESS</div>
          <div style={{ display: "flex", gap: 20 }}>
            {[["Sessions", sessionCount], ["Streak", streak + "d"], ["Overall", overall]].map(([l, v]) => (
              <div key={l} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: COACH_ACCENT }}>{v}</div>
                <div style={{ fontFamily: mono, fontSize: 9, color: C.muted }}>{l.toUpperCase()}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
          {Object.entries(scores).map(([k, v]) => (
            <div key={k} style={{ background: C.card, borderRadius: 8, padding: "10px 12px" }}>
              <div style={{ fontFamily: mono, fontSize: 9, color: C.muted, marginBottom: 5 }}>{scoreName(k).toUpperCase()}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: scoreColor(v) }}>{v.toFixed(1)}</div>
              <div style={{ height: 3, background: C.border, borderRadius: 2, marginTop: 6 }}>
                <div style={{ height: "100%", width: `${v * 10}%`, background: scoreBarColor(k), borderRadius: 2, transition: "width 0.5s" }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Focus selector */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "16px 18px", marginBottom: 14 }}>
        <div style={{ fontFamily: mono, fontSize: 10, color: C.muted, letterSpacing: "0.12em", marginBottom: 10 }}>SESSION FOCUS</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
          {FOCUS_OPTIONS.map(o => (
            <button key={o.value} onClick={() => setFocus(o.value)} style={{
              padding: "6px 12px", borderRadius: 6,
              background: focus === o.value ? COACH_ACCENT : "transparent",
              color: focus === o.value ? C.bg : C.muted,
              border: `1.5px solid ${focus === o.value ? COACH_ACCENT : C.border}`,
              fontFamily: mono, fontSize: 10, fontWeight: 600, cursor: "pointer",
            }}>{o.label}</button>
          ))}
        </div>
        {error && <div style={{ padding: "8px 12px", background: C.err + "15", border: `1px solid ${C.err}44`, borderRadius: 6, fontFamily: mono, fontSize: 11, color: C.err, marginBottom: 12 }}>{error}</div>}
        <button onClick={startSession} disabled={!apiKey} style={{
          width: "100%", padding: "11px", background: apiKey ? COACH_ACCENT : C.border,
          color: C.bg, border: "none", borderRadius: 7,
          fontFamily: mono, fontSize: 13, fontWeight: 700,
          cursor: apiKey ? "pointer" : "not-allowed", letterSpacing: "0.04em",
        }}>{apiKey ? "◈ START TODAY'S SESSION" : "ADD API KEY TO START"}</button>
      </div>

      {/* History toggle */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button onClick={showHistory ? () => setShowHistory(false) : loadHistory} style={{
          background: "transparent", border: `1px solid ${C.border}`, borderRadius: 6,
          padding: "6px 14px", fontFamily: mono, fontSize: 10, color: C.muted, cursor: "pointer",
        }}>{showHistory ? "hide history" : "view session history"}</button>
      </div>

      {showHistory && (
        <div style={{ marginTop: 12, background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden" }}>
          <div style={{ padding: "10px 16px", borderBottom: `1px solid ${C.border}`, fontFamily: mono, fontSize: 10, color: C.muted, letterSpacing: "0.1em" }}>SESSION HISTORY</div>
          {historyLoading ? (
            <div style={{ padding: 20, textAlign: "center", fontFamily: mono, fontSize: 12, color: C.muted }}>Loading...</div>
          ) : history.length === 0 ? (
            <div style={{ padding: 20, textAlign: "center", fontFamily: mono, fontSize: 12, color: C.muted }}>No sessions saved yet.</div>
          ) : (
            <div style={{ maxHeight: 280, overflowY: "auto" }}>
              {history.map((s, i) => (
                <div key={s.id} style={{ display: "flex", alignItems: "center", padding: "10px 16px", borderBottom: `1px solid ${C.border}`, gap: 14 }}>
                  <div style={{ fontFamily: mono, fontSize: 11, color: C.muted, minWidth: 24 }}>#{s.session_number}</div>
                  <div style={{ fontFamily: mono, fontSize: 10, color: C.muted, minWidth: 80 }}>{new Date(s.created_at).toLocaleDateString()}</div>
                  <div style={{ display: "flex", gap: 10, flex: 1 }}>
                    {[["BT", s.score_bt, "#1D9E75"], ["SQL", s.score_sql, "#378ADD"], ["SH", s.score_sh, "#7F77DD"], ["COM", s.score_com, "#D85A30"]].map(([l, v, col]) => (
                      <div key={l} style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: col }}>{v?.toFixed(1)}</div>
                        <div style={{ fontFamily: mono, fontSize: 8, color: C.muted }}>{l}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontFamily: mono, fontSize: 12, fontWeight: 700, color: COACH_ACCENT }}>{s.overall_score?.toFixed(1)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );

  // SESSION
  if (phase === "session") return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontFamily: mono, fontSize: 10, color: COACH_ACCENT, letterSpacing: "0.12em" }}>SESSION IN PROGRESS</div>
        <button onClick={endSessionManually} disabled={loading} style={{
          background: "transparent", border: `1px solid ${C.border}`, borderRadius: 6,
          padding: "5px 12px", fontFamily: mono, fontSize: 10, color: C.muted, cursor: "pointer",
        }}>end session</button>
      </div>

      {/* Chat messages */}
      <div style={{ background: COACH_BG, border: `1.5px solid ${COACH_ACCENT}22`, borderRadius: 12, marginBottom: 12, overflow: "hidden" }}>
        <div style={{ maxHeight: 480, overflowY: "auto", padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
          {msgs.map((m, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: m.role === "user" ? "flex-end" : "flex-start" }}>
              <div style={{ fontFamily: mono, fontSize: 9, color: C.muted, marginBottom: 3, padding: "0 2px" }}>{m.role === "assistant" ? "TRAINER" : "YOU"}</div>
              <div style={{
                maxWidth: "88%", padding: "10px 14px", borderRadius: 10,
                background: m.role === "user" ? COACH_ACCENT + "20" : C.card,
                border: `1px solid ${m.role === "user" ? COACH_ACCENT + "44" : C.border}`,
                fontSize: 13, lineHeight: 1.7, color: C.text,
                borderBottomRightRadius: m.role === "user" ? 3 : 10,
                borderBottomLeftRadius: m.role === "assistant" ? 3 : 10,
                whiteSpace: "pre-wrap",
              }}>{m.content}</div>
            </div>
          ))}
          {loading && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
              <div style={{ fontFamily: mono, fontSize: 9, color: C.muted, marginBottom: 3 }}>TRAINER</div>
              <div style={{ padding: "10px 14px", background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, borderBottomLeftRadius: 3, display: "flex", gap: 5, alignItems: "center" }}>
                {[0, 0.2, 0.4].map((d, i) => (
                  <div key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: COACH_ACCENT, animation: "coachBounce 1.2s infinite", animationDelay: `${d}s`, opacity: 0.7 }} />
                ))}
              </div>
            </div>
          )}
          <div ref={msgsEndRef} />
        </div>

        {/* Input mode toggle + input */}
        <div style={{ borderTop: `1px solid ${C.border}`, padding: "10px 12px" }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
            {["text", "sql"].map(m => (
              <button key={m} onClick={() => setInputMode(m)} style={{
                padding: "3px 10px", borderRadius: 4, fontFamily: mono, fontSize: 10, fontWeight: 700,
                background: inputMode === m ? (m === "sql" ? "#4fc3f7" : COACH_ACCENT) : "transparent",
                color: inputMode === m ? C.bg : C.muted,
                border: `1px solid ${inputMode === m ? (m === "sql" ? "#4fc3f7" : COACH_ACCENT) : C.border}`,
                cursor: "pointer",
              }}>{m === "sql" ? "⬡ SQL" : "✎ Text"}</button>
            ))}
            {inputMode === "sql" && (
              <button onClick={() => setShowTables(s => !s)} style={{
                marginLeft: "auto", padding: "3px 10px", borderRadius: 4,
                fontFamily: mono, fontSize: 10, fontWeight: 700,
                background: showTables ? "#378ADD22" : "transparent",
                color: showTables ? "#378ADD" : C.muted,
                border: `1px solid ${showTables ? "#378ADD" : C.border}`,
                cursor: "pointer",
              }}>⊞ {showTables ? "hide tables" : "show tables"}</button>
            )}
          </div>

          {/* Table reference panel */}
          {inputMode === "sql" && showTables && (
            <div style={{ background: "#040810", border: `1px solid #378ADD33`, borderRadius: 7, padding: "10px 12px", marginBottom: 8, fontFamily: mono, fontSize: 11, color: "#378ADD", lineHeight: 1.8, overflowX: "auto" }}>
              <div style={{ fontSize: 9, letterSpacing: "0.12em", color: C.muted, marginBottom: 6 }}>SESSION TABLES</div>
              {sessionTables.length === 0 ? (
                <div style={{ color: C.muted, fontSize: 11 }}>No tables detected yet — tables will appear here when the trainer introduces them.</div>
              ) : (
                sessionTables.map((t, i) => (
                  <div key={i} style={{ marginBottom: 8 }}>
                    <span style={{ color: "#4fc3f7", fontWeight: 700 }}>{t.name}</span>
                    <span style={{ color: C.muted }}> ({t.cols.join(", ")})</span>
                  </div>
                ))
              )}
            </div>
          )}

          <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && e.ctrlKey && sendMessage()}
              placeholder={inputMode === "sql" ? "Write your SQL here... (Ctrl+Enter to send)" : "Type your answer... (Ctrl+Enter to send)"}
              disabled={loading}
              rows={inputMode === "sql" ? 6 : 3}
              style={{
                flex: 1, background: "#09090f",
                border: `1.5px solid ${inputMode === "sql" ? "#4fc3f722" : C.border}`,
                borderRadius: 7, padding: "9px 13px",
                color: C.text,
                fontFamily: inputMode === "sql" ? mono : sans,
                fontSize: 13, outline: "none", resize: "vertical", lineHeight: 1.6,
              }}
              onFocus={e => e.target.style.borderColor = inputMode === "sql" ? "#4fc3f7" : COACH_ACCENT}
              onBlur={e => e.target.style.borderColor = inputMode === "sql" ? "#4fc3f722" : C.border}
            />
            <button onClick={sendMessage} disabled={loading || !input.trim()} style={{
              padding: "9px 18px", background: COACH_ACCENT, color: C.bg,
              border: "none", borderRadius: 7, fontFamily: mono, fontSize: 12, fontWeight: 700,
              cursor: loading || !input.trim() ? "not-allowed" : "pointer",
              opacity: loading || !input.trim() ? 0.4 : 1, alignSelf: "flex-end",
            }}>Send</button>
          </div>
        </div>
      </div>

      {error && <div style={{ padding: "8px 12px", background: C.err + "15", border: `1px solid ${C.err}44`, borderRadius: 6, fontFamily: mono, fontSize: 11, color: C.err, marginBottom: 10 }}>{error}</div>}
      <style>{`@keyframes coachBounce { 0%,80%,100%{transform:translateY(0);opacity:0.4} 40%{transform:translateY(-5px);opacity:1} }`}</style>
    </div>
  );

  // RESULTS
  if (phase === "results") {
    const names = { bt: "Business thinking", sql: "SQL technical", sh: "Stakeholder", com: "Communication" };
    const colors = { bt: "#1D9E75", sql: "#378ADD", sh: "#7F77DD", com: "#D85A30" };
    return (
      <div>
        <div style={{ background: COACH_BG, border: `1.5px solid ${COACH_ACCENT}33`, borderRadius: 12, padding: "20px", marginBottom: 16 }}>
          <div style={{ fontFamily: mono, fontSize: 10, color: COACH_ACCENT, letterSpacing: "0.12em", marginBottom: 16 }}>SESSION {sessionCount} COMPLETE</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 16 }}>
            {Object.entries(scores).map(([k, v]) => {
              const prev = v - (newScores[k] ? newScores[k] - v : 0);
              const delta = newScores[k] ? (newScores[k] - (v - (newScores[k] - v))).toFixed(1) : null;
              return (
                <div key={k} style={{ background: C.card, borderRadius: 8, padding: "12px", textAlign: "center" }}>
                  <div style={{ fontFamily: mono, fontSize: 8, color: C.muted, marginBottom: 6 }}>{names[k].toUpperCase()}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: colors[k] }}>{v.toFixed(1)}</div>
                  {newScores[k] !== undefined && (
                    <div style={{ fontFamily: mono, fontSize: 10, color: parseFloat(newScores[k]) >= (v - (newScores[k] - v)) ? C.ok : C.err, marginTop: 3 }}>
                      {parseFloat(newScores[k]) >= (v - (newScores[k] - v)) ? "+" : ""}{(newScores[k] - (v - (newScores[k] - v))).toFixed(1)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontFamily: mono, fontSize: 11, color: savingToDb ? C.warn : dbSaved ? C.ok : C.muted }}>
              {savingToDb ? "Saving to Supabase..." : dbSaved ? "Saved to Supabase" : ""}
            </div>
            <div style={{ fontFamily: mono, fontSize: 11, color: C.muted }}>Streak: {streak} days</div>
          </div>
        </div>
        <button onClick={() => { setPhase("home"); setNewScores({}); setMsgs([]); setDbSaved(false); }} style={{
          width: "100%", padding: "11px", background: "transparent",
          border: `1.5px solid ${COACH_ACCENT}`, color: COACH_ACCENT,
          borderRadius: 7, fontFamily: mono, fontSize: 12, fontWeight: 700, cursor: "pointer",
        }}>← BACK TO DASHBOARD</button>
      </div>
    );
  }

  return null;
}

// ── API KEY BANNER ────────────────────────────────────────────────────────────

function ApiKeyBanner({ apiKey, onSet }) {
  const [draft, setDraft] = useState("");
  const [show, setShow] = useState(false);

  if (apiKey) return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", background: C.ok + "10", border: `1px solid ${C.ok}33`, borderRadius: 8, marginBottom: 20 }}>
      <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.ok, boxShadow: `0 0 6px ${C.ok}` }} />
      <span style={{ fontFamily: mono, fontSize: 11, color: C.ok }}>AI Checker Active</span>
      <button onClick={() => onSet("")} style={{ marginLeft: "auto", background: "transparent", border: "none", color: C.muted, fontFamily: mono, fontSize: 11, cursor: "pointer" }}>× Remove key</button>
    </div>
  );

  return (
    <div style={{ padding: "16px 18px", background: C.warn + "0c", border: `1.5px solid ${C.warn}44`, borderRadius: 10, marginBottom: 20 }}>
      <div style={{ fontFamily: mono, fontSize: 11, color: C.warn, marginBottom: 10 }}>⚠ Add your Anthropic API key to enable AI answer checking</div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input type={show ? "text" : "password"} value={draft} onChange={e => setDraft(e.target.value)}
          placeholder="sk-ant-..." onKeyDown={e => e.key === "Enter" && draft.trim() && onSet(draft.trim())}
          style={{ flex: 1, background: "#09090f", border: `1.5px solid ${C.border}`, borderRadius: 6, padding: "8px 12px", color: C.text, fontFamily: mono, fontSize: 12, outline: "none" }}
          onFocus={e => e.target.style.borderColor = C.warn}
          onBlur={e => e.target.style.borderColor = C.border}
        />
        <button onClick={() => setShow(s => !s)} style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 6, padding: "8px 10px", color: C.muted, fontFamily: mono, fontSize: 11, cursor: "pointer" }}>{show ? "hide" : "show"}</button>
        <Btn onClick={() => draft.trim() && onSet(draft.trim())} disabled={!draft.trim()} color={C.warn}>Activate</Btn>
      </div>
      <div style={{ fontFamily: mono, fontSize: 10, color: C.muted, marginTop: 8 }}>Key stays in memory only. Get yours at console.anthropic.com</div>
    </div>
  );
}

// ── APP SHELL ─────────────────────────────────────────────────────────────────

export default function App() {
  const [module, setModule] = useState("sql");
  const [tab, setTab] = useState("flashcards");
  const [apiKey, setApiKey] = useState("");
  const [progress, setProgress] = useState(() => loadProgress() || defaultProgress());
  const [activeDomainPack, setActiveDomainPack] = useState(null);
  const [sessionSummary, setSessionSummary] = useState(null);
  const [sessionStart] = useState(Date.now());
  const color = MODULES.find(m => m.id === module)?.color || C.accent;

  // Update streak on load
  useEffect(() => {
    const today = new Date().toDateString();
    if (progress.lastSessionDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      const newStreak = progress.lastSessionDate === yesterday ? progress.streak : 0;
      const updated = { ...progress, lastSessionDate: today, streak: newStreak };
      setProgress(updated);
      saveProgress(updated);
    }
  }, []);

  const handleScore = useCallback((mod, idx, score, card) => {
    setProgress(prev => {
      const key = `${mod}:${idx}`;
      const allTimeScores = { ...prev.allTimeScores, [key]: score };

      // Spaced repetition tracking
      const prevCounts = prev.scoreCounts?.[key] || { strong: 0, partial: 0, weak: 0 };
      const scoreCounts = {
        ...prev.scoreCounts,
        [key]: { ...prevCounts, [score]: (prevCounts[score] || 0) + 1 }
      };
      const lastSeen = { ...prev.lastSeen, [key]: new Date().toISOString() };

      // Weak queue — add if weak/partial, remove if strong
      let weakQueue = [...(prev.weakQueue || [])];
      const alreadyIn = weakQueue.some(w => w.key === key);
      if (score === "weak" || score === "partial") {
        if (!alreadyIn) weakQueue.push({ key, mod, idx, q: card?.q || "" });
      } else {
        weakQueue = weakQueue.filter(w => w.key !== key);
      }

      const updated = { ...prev, allTimeScores, scoreCounts, lastSeen, weakQueue };
      saveProgress(updated);
      return updated;
    });
  }, []);

  const handleSessionComplete = useCallback(() => {
    setProgress(prev => {
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      const newStreak = prev.lastSessionDate === yesterday || prev.lastSessionDate === today
        ? (prev.lastSessionDate === today ? prev.streak : prev.streak + 1)
        : 1;
      const updated = { ...prev, totalSessions: prev.totalSessions + 1, streak: newStreak, lastSessionDate: today };
      saveProgress(updated);
      return updated;
    });
  }, []);

  const handleSessionDone = useCallback((summary) => {
    handleSessionComplete();
    setSessionSummary(summary);
  }, [handleSessionComplete]);

  const resetProgress = () => {
    const fresh = defaultProgress();
    setProgress(fresh);
    saveProgress(fresh);
  };

  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: sans, color: C.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=DM+Mono:wght@400;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: ${C.surface}; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 3px; }
        button { transition: opacity 0.15s; font-family: inherit; }
        button:hover:not(:disabled) { opacity: 0.8; }
      `}</style>

      {/* Header */}
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontFamily: mono, fontWeight: 600, fontSize: 14, letterSpacing: "0.06em" }}>
            <span style={{ color: C.accent }}>⬡ </span>ANALYST SHARPENER
          </div>
          <div style={{ fontFamily: mono, fontSize: 10, color: C.muted, marginTop: 3 }}>
            SQL · EXCEL · TABLEAU · PYTHON — AI-graded daily practice
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.accent }}>{progress.streak}</div>
            <div style={{ fontFamily: mono, fontSize: 9, color: C.muted }}>DAY STREAK</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: apiKey ? C.ok : C.err, boxShadow: `0 0 6px ${apiKey ? C.ok : C.err}` }} />
            <span style={{ fontFamily: mono, fontSize: 11, color: apiKey ? C.ok : C.err }}>{apiKey ? "AI Live" : "No API Key"}</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "22px 16px 60px" }}>

        {/* Session Summary Modal */}
        {sessionSummary && (
          <SessionSummary
            summary={sessionSummary}
            onClose={() => setSessionSummary(null)}
            onDrillWeaks={() => { setSessionSummary(null); setTab("weakqueue"); setActiveDomainPack(null); }}
          />
        )}

        <ApiKeyBanner apiKey={apiKey} onSet={setApiKey} />
        <StatsPanel progress={progress} onResetProgress={resetProgress} />

        {/* Domain Pack Selector */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontFamily: mono, fontSize: 9, color: C.muted, letterSpacing: "0.12em", marginBottom: 8 }}>DOMAIN PACKS</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {Object.values(DOMAIN_PACKS).map(pack => {
              const isActive = activeDomainPack?.id === pack.id;
              const doneCount = Object.entries(progress.allTimeScores)
                .filter(([k, v]) => k.startsWith(`domain-${pack.id}:`) && v === "strong").length;
              return (
                <button key={pack.id} onClick={() => {
                  setActiveDomainPack(isActive ? null : pack);
                  if (!isActive) setTab("domain");
                }} style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "6px 12px",
                  background: isActive ? pack.color : "transparent",
                  color: isActive ? C.bg : pack.color,
                  border: `1.5px solid ${pack.color}`, borderRadius: 6,
                  fontFamily: mono, fontSize: 11, fontWeight: 600, cursor: "pointer",
                }}>
                  {pack.icon} {pack.label}
                  {doneCount > 0 && (
                    <span style={{ background: isActive ? "rgba(0,0,0,0.2)" : pack.color + "22", borderRadius: 3, padding: "1px 5px", fontSize: 9 }}>
                      {doneCount}✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Core Module selector */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
          {MODULES.map(m => {
            const sortedCards = sortCardsBySpacedRep(FLASHCARDS[m.id] || [], m.id, progress);
            return (
              <button key={m.id} onClick={() => { setModule(m.id); setTab("flashcards"); setActiveDomainPack(null); }} style={{
                display: "flex", alignItems: "center", gap: 7, padding: "7px 14px",
                background: module === m.id && tab !== "domain" ? m.color : "transparent",
                color: module === m.id && tab !== "domain" ? C.bg : m.color,
                border: `1.5px solid ${m.color}`, borderRadius: 7,
                fontFamily: mono, fontSize: 12, fontWeight: 600,
                cursor: "pointer", letterSpacing: "0.04em",
              }}>
                {m.icon} {m.label}
                <span style={{ background: module === m.id && tab !== "domain" ? "rgba(0,0,0,0.2)" : m.color + "20", borderRadius: 3, padding: "1px 5px", fontSize: 10 }}>
                  {(FLASHCARDS[m.id] || []).length}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tab switcher */}
        <div style={{ display: "flex", gap: 2, background: C.surface, padding: 3, borderRadius: 8, border: `1px solid ${C.border}`, marginBottom: 22, overflowX: "auto" }}>
          {[
            { id: "flashcards", label: "Cards" },
            { id: "coding", label: "Code" },
            { id: "quickfire", label: "⚡ Fire" },
            { id: "weakqueue", label: `🎯 Drill${(progress.weakQueue||[]).length > 0 ? ` (${progress.weakQueue.length})` : ""}` },
            { id: "interview", label: "🎙 Sim" },
            { id: "sqlprep", label: "📋 SQL Prep" },
            { id: "coach", label: "◈ Coach" },
            ...(activeDomainPack ? [{ id: "domain", label: `${activeDomainPack.icon} ${activeDomainPack.label}` }] : []),
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flex: "0 0 auto", padding: "7px 10px",
              background: tab === t.id ? (t.id === "coach" ? "#e879f9" : activeDomainPack && t.id === "domain" ? activeDomainPack.color : color) : "transparent",
              color: tab === t.id ? C.bg : C.muted,
              border: "none", borderRadius: 6,
              fontFamily: mono, fontSize: 10, fontWeight: 700,
              cursor: "pointer", letterSpacing: "0.02em", whiteSpace: "nowrap",
            }}>{t.label}</button>
          ))}
        </div>

        {tab === "flashcards" && <FlashcardMode key={module + "-f"} module={module} apiKey={apiKey} progress={progress} onScore={handleScore} onSessionDone={handleSessionDone} />}
        {tab === "coding"     && <CodingMode    key={module + "-c"} module={module} apiKey={apiKey} onScore={handleScore} />}
        {tab === "quickfire"  && <QuickFireMode key="qf" apiKey={apiKey} onScore={handleScore} onSessionComplete={() => handleSessionDone({ mode: "Quick-Fire", questionsAnswered: 25, strong: 0, partial: 0, weak: 0, durationMin: Math.round((Date.now() - sessionStart) / 60000), topMissed: [] })} />}
        {tab === "weakqueue"  && <WeakQueueMode key="wq" apiKey={apiKey} progress={progress} onScore={handleScore} />}
        {tab === "interview"  && <InterviewSimMode key="iv" apiKey={apiKey} onSessionComplete={handleSessionComplete} />}
        {tab === "sqlprep"   && <SQLPrepMode key="sqlprep" apiKey={apiKey} onScore={handleScore} />}
        {tab === "coach"      && <AnalyticsCoach key="coach" apiKey={apiKey} />}
        {tab === "domain" && activeDomainPack && (
          <DomainPackMode
            key={`domain-${activeDomainPack.id}`}
            pack={activeDomainPack}
            apiKey={apiKey}
            progress={progress}
            onScore={handleScore}
            onSessionDone={handleSessionDone}
          />
        )}

        <div style={{ marginTop: 36, padding: "13px 18px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, fontFamily: mono, fontSize: 11, color: C.muted, lineHeight: 1.7 }}>
          <span style={{ color: C.accent }}>TIP: </span>
          Write your answer first. Then hit Check. The AI evaluates before you peek. That's the whole game — honest reps.
        </div>
      </div>
    </div>
  );
}
