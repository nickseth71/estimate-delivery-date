var xlsxURL = $("#xlsx_file_url").val();

const xlsxToArray = async (url) => {
  try {
    // const response = await fetch(url);
    // const data = await response.arrayBuffer();
    // var xlsxOUT = XLSX.read(data, { type: "array" });
    // var firstSheet = xlsxOUT.Sheets[xlsxOUT.SheetNames[0]];
    // // header: 1 instructs xlsx to create an 'array of arrays'
    // let pincode = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
    // console.log('response ',pincode);
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
  const pinCode = $(".pincode_value").val();
  console.log("pinCode ", pinCode);
  if (pinCode != "") {
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
          console.log("rowObject ", rowObject);
          const hasAvailabl = rowObject.filter(
            (pc) => pc["pincode"] == pinCode
          );
          console.log("hasAvailabl ", hasAvailabl);
          if (hasAvailabl.length == 0) {
            $("#CartDrawer-Checkout").attr("disabled", true);
            pin_message($("#xlsx_file_url").data("error"), false);
          } else {
            $("#CartDrawer-Checkout").attr("disabled", false);
            pin_message("success", true);
          }
        }
      });
    };
  }
});

/* START:: Shopify checkout */
/*
$(document).on("keyup", "#checkout_shipping_address_zip", function () {
  const pinCode = $(this).val();
  checkEST(pinCode);
});

$(document).on(
  "change",
  "#checkout_shipping_address_zip,#checkout_shipping_address_id,#checkout_shipping_address_country,#checkout_shipping_address_first_name,#checkout_shipping_address_last_name,#checkout_shipping_address_address1,#checkout_shipping_address_address2,#checkout_shipping_address_city,#checkout_shipping_address_province,#checkout_shipping_address_phone",
  function () {
    const pinCode = $("#checkout_shipping_address_zip").val();
    checkEST(pinCode);
  }
);

try {
  (function ($) {
    $(document).on("page:load page:change", function () {
      if ($("#checkout_shipping_address_zip").length > 0) {
        const pinCode = $("#checkout_shipping_address_zip").val();
        console.log("pinCode ", pinCode);
        checkEST(pinCode);
      }
    });
  })(Checkout.$);
} catch (error) {
  console.warn(error);
}

 if ($(".review-block__content address.address--tight").length > 0) {
  // const orderData = $('select[data-address-selector] option:selected').data('properties');
  // const pinCode = orderData.zip;
  const shippingArr = $(".review-block__content address.address--tight")
    .text()
    .trim()
    .split(" ");
  //console.log('pinCode ',pinCode);
  // console.log('orderData ',orderData);
  xlsxToArray(xlsxURL).then((result) => {
    console.log("xlsxURL ", result);
    //const hasAvailabl = result.filter((pc) => pc[0] == pinCode);
    let hasAvailabl = false;
    shippingArr.forEach((item) => {
      console.log("item ", item);
      const hasAvailablaaa = result.filter((pc) => pc[0] == item);
      if (hasAvailablaaa.length > 0) {
        hasAvailabl = true;
      }
    });
    // console.log('hasAvailabl ',hasAvailabl);
    if (hasAvailabl == false) {
      $("#continue_button").attr("disabled", true);
      if ($(".zip-code-error").length == 0) {
        const errorMessage = $("#xlsx_file_url").data("error");
        $(".step__sections .step__footer").prepend(
          `<div class="zip-code-error">${errorMessage}</div>`
        );
      } else {
        $(".zip-code-error").show();
      }
    } else {
      $("#continue_button").attr("disabled", false);
      $(".zip-code-error").hide();
    }
  });
}

async function checkEST(pinCode) {
  if (pinCode.length == 6) {
    let fileReader = new FileReader();
    let blob = await fetch(xlsxURL).then((r) => r.blob());
    let flag = 0;
    fileReader.readAsBinaryString(blob);
    fileReader.onload = (event) => {
      let data = event.target.result;
      let workbook = XLSX.read(data, { type: "binary" });
      const errorMessage = $("#xlsx_file_url").data("error");
      workbook.SheetNames.forEach((sheet) => {
        flag += 1;
        let rowObject = XLSX.utils.sheet_to_row_object_array(
          workbook.Sheets[sheet]
        );
        if (flag == 2) {
          console.log("rowObject ", rowObject);
          const hasAvailabl = rowObject.filter(
            (pc) => pc["pincode"] == pinCode
          );
          console.log("hasAvailabl ", hasAvailabl);
          if (hasAvailabl.length == 0) {
            $("#continue_button").attr("disabled", true);
            if ($(".zip-code-error").length == 0) {
              $(".step__sections").append(
                `<div class="zip-code-error">${errorMessage}</div>`
              );
            } else {
              $(".zip-code-error").show();
            }
          } else {
            $("#continue_button").attr("disabled", false);
            $(".zip-code-error").hide();
          }
        }
      });
    };
  }
}*/
/* END:: Shopify checkout */

function pin_message(msg, status = true) {
  if (status) {
    $(".pincode_checker_message")
      .html(msg)
      .addClass("sucess")
      .removeClass("error");
  } else {
    $(".pincode_checker_message")
      .html(msg)
      .addClass("error")
      .removeClass("sucess");
  }
}
