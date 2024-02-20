var xlsxURL = $("#xlsx_file_url").val();

const xlsxToArray = async (url) => {
  try {
    let fileReader = new FileReader();
    let blob = await fetch(url).then((r) => r.blob());
    let flag = 0;
    fileReader.readAsBinaryString(blob);
    fileReader.onload = (event) => {
      let data = event.target.result;
      let workbook = XLSX.read(data, { type: "binary" });
      workbook.SheetNames.forEach((sheet) => {
        flag += 1;
        let rowObject = XLSX.utils.sheet_to_row_object_array(
          workbook.Sheets[sheet]
        );
        if (flag == 2) {
          return rowObject;
        }
      });
    };
  } catch (err) {
    console.log("ERRORS:", err);
  }
};

$(document).on("click", ".pin_check", async function () {
  var $el = $(this),
    $wrap = $el.closest(".pdp_estimate--delivery"),
    $checkEl = $wrap.find(".estimate--delivery_wrap"),
    $changeEl = $wrap.find(".estimate--delivery_succcess"),
    pinCode = $wrap.find(".pincode_value").val(),
    $header = $wrap.find(".delivery_header");
  console.log(validateIndianPIN(pinCode), "<<<<");
  if (!validateIndianPIN(pinCode)) {
    pin_message("Enter a valid pincode", false);
    return;
  }
  $(".pincode_checker_message").html("");
  $(".pdp_estimate--delivery, .pincode_checker_message").removeClass(
    "error success"
  );
  $el.addClass("loading");
  let fileReader = new FileReader();
  let blob = await fetch(xlsxURL).then((r) => r.blob());
  let flag = 0;
  fileReader.readAsBinaryString(blob);
  fileReader.onload = (event) => {
    let data = event.target.result;
    let workbook = XLSX.read(data, { type: "binary" });
    workbook.SheetNames.forEach((sheet) => {
      flag += 1;
      let rowObject = XLSX.utils.sheet_to_row_object_array(
        workbook.Sheets[sheet]
      );
      if (flag == 2) {
        const hasAvailabl = rowObject.filter((pc) => pc["pincode"] == pinCode);
        if (hasAvailabl.length == 0) {
          $("#CartDrawer-Checkout").attr("disabled", true);
          pin_message($("#xlsx_file_url").data("error"), false);
        } else {
          $("#CartDrawer-Checkout").attr("disabled", false);
          let est_range = hasAvailabl[0]["est-time"];
          let datess = formatDate(est_range, [], false);
          let suc_mgs = $("#xlsx_file_url").data("suc_mgs");
          let for_date = `${datess.min_eta} ${
            datess.max_eta != null ? " to " + datess.max_eta : ""
          }`;
          pin_message(
            suc_mgs.replaceAll("<date></date>", `<date>${for_date}</date>`),
            true
          );
          $changeEl.find(".after_success zipcode").html(pinCode);
          $checkEl.hide();
          $changeEl.show();
          $header.hide();
        }
      }
    });
    $el.removeClass("loading");
  };
});

$(document).on("keypress", ".pincode_value", function (event) {
  if (event.which === 13) {
    var $el = $(this),
      $wrap = $el.closest(".pdp_estimate--delivery"),
      $btn = $wrap.find(".pin_check");
    $btn.click();
  }
});

$(document).on("click", ".pin_change", function () {
  var $el = $(this),
    $wrap = $el.closest(".pdp_estimate--delivery"),
    $checkEl = $wrap.find(".estimate--delivery_wrap"),
    $changeEl = $wrap.find(".estimate--delivery_succcess"),
    $header = $wrap.find(".delivery_header");
  $checkEl.show();
  $changeEl.hide();
  $header.show();
});

function validateIndianPIN(pin) {
  var regex = /^[1-9][0-9]{5}$/;
  return regex.test(pin);
}

function formatDate(offsetRange, holidays = [], skipWeekends = false) {
  var [minOffset, maxOffset] = offsetRange.split("-").map(Number),
    i = minOffset,
    j = maxOffset;

  const today = new Date();
  today.setDate(today.getDate());
  const minDate = new Date(today);
  const maxDate = new Date(today);
  if (skipWeekends && holidays.length > 0) {
    while (i > 0) {
      minDate.setDate(minDate.getDate() + 1);
      if (!(isWeekend(minDate) || holidays.includes(formatDateStr(minDate))))
        i--;
    }
    while (j > 0) {
      maxDate.setDate(maxDate.getDate() + 1);
      if (!(isWeekend(maxDate) || holidays.includes(formatDateStr(maxDate))))
        j--;
    }
  } else if (skipWeekends && holidays.length == 0) {
    while (i > 0) {
      minDate.setDate(minDate.getDate() + 1);
      if (!isWeekend(minDate)) i--;
    }
    while (j > 0) {
      maxDate.setDate(maxDate.getDate() + 1);
      if (!isWeekend(maxDate)) j--;
    }
  } else if (!skipWeekends && holidays.length > 0) {
    while (i > 0) {
      minDate.setDate(minDate.getDate() + 1);
      if (!holidays.includes(formatDateStr(maxDate))) i--;
    }
    while (j > 0) {
      maxDate.setDate(maxDate.getDate() + 1);
      if (!holidays.includes(formatDateStr(maxDate))) j--;
    }
  } else {
    minDate.setDate(today.getDate() + minOffset);
    maxDate.setDate(today.getDate() + maxOffset);
  }

  return {
    min_eta: formatDateStr(minDate, "str"),
    max_eta: formatDateStr(maxDate, "str"),
  };
}

function formatDateStr(date, type = "dash") {
  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const monthsOfYear = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const dayOfWeek = daysOfWeek[date.getDay()];
  const monthName = monthsOfYear[date.getMonth()];
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  if (
    isNaN(year) ||
    year == null ||
    isNaN(month) ||
    month == null ||
    isNaN(day) ||
    day == null
  )
    return null;
  if (type != "dash") return `${dayOfWeek}, ${day} ${monthName}`;
  return `${year}-${month}-${day}`;
}

function isWeekend(date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}

function pin_message(msg, status = true) {
  if (msg == "") return;
  $(".pincode_checker_message").html("");
  $(".pdp_estimate--delivery, .pincode_checker_message").removeClass(
    "error success"
  );
  if (status) {
    $(".pincode_checker_message.__success").html(msg).addClass("success");
    $(".pdp_estimate--delivery").addClass("success");
  } else {
    $(".pincode_checker_message.__error").html(msg).addClass("error");
    $(".pdp_estimate--delivery").addClass("error");
  }
}
