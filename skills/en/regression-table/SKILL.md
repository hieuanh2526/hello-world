---
name: regression-table
description: Export regressions estimated in the project's Stata do-file to a paper-ready LaTeX table with esttab. Use when the user asks for a regression table, a results table, or to export estimates to LaTeX. Do not use for descriptive-statistics tables, balance tables, Word/Excel output, or estimates that are not produced by a do-file in this project.
---

# Regression table

The table is produced by the do-file, never by an interactive Stata
session: stored estimates exist only inside the Stata session that
created them, so an `esttab` run in a separate session finds nothing.

## Steps

1. **Check that `esttab` is installed, inside Stata.** `esttab` is a
   Stata command, not a shell program, so `which esttab` in a terminal
   always fails. Put this near the top of the do-file, after `version`:

   ```stata
   capture which esttab
   if _rc {
       display as error "esttab not installed (ssc install estout)"
       exit 199
   }
   ```

   If the log shows this message, stop and ask the user. Do not install
   packages yourself.

2. **Store every model.** Right after each regression, add
   `estimates store mN`, numbered in the order the models should appear
   (`m1`, `m2`, ...). Keep the regressions' existing `vce()` option.

3. **Label the variables that appear in the table.** Variables created
   with `gen` have no label, so `label` would show raw names:

   ```stata
   label variable lprice "Log price"
   ```

   Factor variables (`i.x`) use their value labels; check that those exist.

4. **Edit the `esttab` line in the do-file.** Replace any existing
   `esttab` call for this table; do not add a second one.

   ```stata
   esttab m1 m2 using "output/table1.tex", replace ///
       se label booktabs nobaselevels ///
       star(* 0.10 ** 0.05 *** 0.01) ///
       stats(N r2, fmt(%9.0fc %9.3f) labels("Observations" "R-squared")) ///
       addnotes("Standard errors are heteroskedasticity-robust.")
   ```

   - List every stored model, in order.
   - The file name is `output/table1.tex` unless the user gives one.
     If that file already holds a different table, use the next free
     number and say so.
   - Make the note match the `vce()` the regressions actually use
     (robust, clustered by what, or conventional).

5. **Run the do-file and read the log.** Use the command in `AGENTS.md`.
   The exit code is 0 even when Stata fails, so search `analysis.log`
   for error codes (`r(` followed by a number) and show its last
   20 lines.

6. **Check the table against the log.** Open the `.tex` file and confirm:
   - one column per stored model, in the intended order;
   - standard errors in parentheses, no base-level rows of zeros;
   - the observation count in each column equals the `Number of obs`
     reported for that regression in the log;
   - one coefficient and its standard error per column match the log.

   If any check fails, fix the do-file and rerun. Do not edit the
   `.tex` file by hand.

7. **Report** the file written, the number of columns, the type of
   standard errors, and any check that could not be done.

## Failure modes

- Running `esttab` in a new Stata session after the do-file has finished.
- Taking a 0 exit code as success without reading the log.
- A table note that says "robust" when the models are not.
- Hand-editing the `.tex` output, which the next run overwrites.
